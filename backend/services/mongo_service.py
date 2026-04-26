import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from backend.config import get_settings
    from backend.utils.country_mappings import NAME_TO_ISO3, ISO3_TO_NAME
    from backend.data.country_coords import COUNTRY_COORDS
except ModuleNotFoundError:
    from config import get_settings
    from utils.country_mappings import NAME_TO_ISO3, ISO3_TO_NAME
    from data.country_coords import COUNTRY_COORDS


_motor_client = None


def _get_client():
    global _motor_client
    if _motor_client is None:
        from motor.motor_asyncio import AsyncIOMotorClient
        settings = get_settings()
        _motor_client = AsyncIOMotorClient(settings.mongo_uri)
    return _motor_client


class MongoDataApiService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._mock_cache: dict[str, Any] | None = None

    @property
    def configured(self) -> bool:
        return bool(self.settings.mongo_uri)

    def _db(self):
        return _get_client()[self.settings.mongo_database]

    def _mock_data(self) -> dict[str, Any]:
        """Fallback to mock data if MongoDB not configured."""
        if self._mock_cache:
            return self._mock_cache
            
        path = Path(__file__).resolve().parents[1] / "data" / "mock_countries.json"
        if not path.exists():
            return {"updated_at": datetime.now(timezone.utc).isoformat(), "countries": [], "alerts": []}
        
        data = json.loads(path.read_text(encoding="utf-8"))
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._mock_cache = data
        return data

    async def get_countries(self) -> dict[str, Any]:
        """
        Get all countries with aggregated scores from country_category_news.
        Since we don't have a 'countries' collection, we aggregate from news data.
        """
        if not self.configured:
            mock = self._mock_data()
            return {
                "updated_at": mock["updated_at"],
                "countries": [
                    {
                        "iso3": c.get("_id", ""),
                        "name": c.get("name", ""),
                        "index_value": c.get("invisible_index", 0),
                        "latitude": c.get("lat", 0),
                        "longitude": c.get("lng", 0),
                    }
                    for c in mock["countries"]
                ],
            }

        # Aggregate all categories for each country to calculate overall index
        pipeline = [
            {
                "$group": {
                    "_id": "$country",  # Group by country name
                    "avg_score": {"$avg": "$final_score"},
                    "total_articles": {"$sum": {"$size": "$articles"}},
                    "categories": {"$sum": 1},
                    "last_updated": {"$max": "$updated_at"},
                }
            }
        ]
        
        cursor = self._db()["country_category_news"].aggregate(pipeline)
        docs = await cursor.to_list(length=200)
        
        countries = []
        for doc in docs:
            country_name = doc["_id"]
            iso3 = NAME_TO_ISO3.get(country_name, country_name[:3].upper())
            
            # Get coordinates from mapping
            coords = COUNTRY_COORDS.get(iso3, {"lat": 0, "lng": 0})
            
            countries.append({
                "iso3": iso3,
                "name": country_name,
                "index_value": round(doc.get("avg_score", 0), 1),
                "latitude": coords["lat"],
                "longitude": coords["lng"],
            })
        
        return {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "countries": countries,
        }

    async def get_country(self, iso3: str) -> dict[str, Any]:
        """Get basic country info."""
        if not self.configured:
            for item in self._mock_data()["countries"]:
                if item.get("_id") == iso3.upper():
                    return {
                        "iso3": item.get("_id", ""),
                        "name": item.get("name", ""),
                        "index_value": item.get("invisible_index", 0),
                        "latitude": item.get("lat", 0),
                        "longitude": item.get("lng", 0),
                    }
            return {}

        country_name = ISO3_TO_NAME.get(iso3.upper())
        if not country_name:
            return {}

        # Aggregate this country's scores
        pipeline = [
            {"$match": {"country": country_name}},
            {
                "$group": {
                    "_id": "$country",
                    "avg_score": {"$avg": "$final_score"},
                    "total_articles": {"$sum": {"$size": "$articles"}},
                }
            }
        ]
        
        cursor = self._db()["country_category_news"].aggregate(pipeline)
        docs = await cursor.to_list(length=1)
        
        if not docs:
            return {}
        
        coords = COUNTRY_COORDS.get(iso3.upper(), {"lat": 0, "lng": 0})
        
        return {
            "iso3": iso3.upper(),
            "name": country_name,
            "index_value": round(docs[0].get("avg_score", 0), 1),
            "latitude": coords["lat"],
            "longitude": coords["lng"],
        }

    async def get_country_details(self, iso3: str) -> dict[str, Any]:
        """Get detailed country metrics including all categories."""
        if not self.configured:
            # Return mock data
            for item in self._mock_data()["countries"]:
                if item.get("_id") == iso3.upper():
                    try:
                        from data.mock_countries import mockCountryDetails
                        return mockCountryDetails.get(iso3.upper(), {})
                    except:
                        return {}
            return {}

        country_name = ISO3_TO_NAME.get(iso3.upper())
        if not country_name:
            return {}

        # Get all categories for this country
        cursor = self._db()["country_category_news"].find({"country": country_name})
        categories = await cursor.to_list(length=50)
        
        if not categories:
            return {}

        # Calculate aggregate metrics
        total_articles = sum(len(cat.get("articles", [])) for cat in categories)
        avg_score = sum(cat.get("final_score", 0) for cat in categories) / len(categories) if categories else 0
        
        # Build trending topics from categories
        trending_topics = []
        for cat in sorted(categories, key=lambda x: x.get("final_score", 0), reverse=True)[:3]:
            if cat.get("final_score", 0) > 0:
                trending_topics.append({
                    "topic": cat["category"],
                    "volume": len(cat.get("articles", [])),
                    "sentiment": "negative" if cat.get("final_score", 0) > 70 else "mixed",
                })

        # Build news articles from all categories
        news_articles = []
        article_id = 1
        for cat in categories:
            for article in cat.get("articles", [])[:2]:  # Top 2 from each category
                if article.get("title"):
                    news_articles.append({
                        "id": article_id,
                        "title": article.get("title", ""),
                        "source": cat["category"],
                        "url": article.get("url", ""),
                        "published": cat.get("updated_at", ""),
                        "summary": article.get("content", "")[:200] + "..." if article.get("content") else "",
                        "credibility": "verified",
                        "impact_score": round(cat.get("final_score", 0)),
                    })
                    article_id += 1
        
        # Calculate metrics
        index_value = round(avg_score, 1)
        
        return {
            "iso3": iso3.upper(),
            "name": country_name,
            "index_value": index_value,
            "trend": "up" if index_value > 60 else "down" if index_value < 40 else "stable",
            "change_24h": round((index_value - 50) * 0.1, 1),  # Simulated
            "last_updated": categories[0].get("updated_at", datetime.now(timezone.utc).isoformat()),
            "metrics": {
                "misinformation_score": min(100, round(index_value * 0.9)),
                "bot_activity": min(100, round(index_value * 0.75)),
                "fact_check_ratio": max(5, round(100 - index_value * 0.7)),
                "source_diversity": max(5, round(100 - index_value * 0.65)),
            },
            "trending_topics": trending_topics,
            "news_articles": news_articles[:10],  # Top 10 articles
        }

    async def get_country_news(self, country: str) -> list[dict[str, Any]]:
        """Get all category news for a country (for agent-news endpoint)."""
        if not self.configured:
            return []

        cursor = self._db()["country_category_news"].find({"country": country})
        docs = await cursor.to_list(length=50)
        
        # Remove _id field and return
        return [{k: v for k, v in d.items() if k != "_id"} for d in docs]

    async def latest_alerts(self) -> list[dict[str, Any]]:
        """Get latest alerts."""
        if not self.configured:
            return [
                {
                    "country_iso3": a.get("country_iso3", ""),
                    "country_name": a.get("country_name", ""),
                    "message": a.get("message", ""),
                    "timestamp": a.get("timestamp", ""),
                    "severity": a.get("severity", ""),
                }
                for a in self._mock_data().get("alerts", [])
            ]

        cursor = self._db()["alert_log"].find({}).sort("fired_at", -1).limit(10)
        docs = await cursor.to_list(length=10)
        
        return [
            {
                "country_iso3": d.get("country_code", ""),
                "country_name": d.get("country_name", ""),
                "message": f"Index spike: +{d.get('delta', 0):.0f} points",
                "timestamp": d.get("fired_at", ""),
                "severity": "critical" if d.get("delta", 0) > 5000 else "high",
            }
            for d in docs
        ]

    async def insert_alert(self, payload_data: dict[str, Any]) -> None:
        """Insert an alert."""
        if not self.configured:
            return
        await self._db()["alert_log"].insert_one(payload_data)

    async def upsert_country_news(
        self,
        country: str,
        category: str,
        links: list[str],
        articles: list[dict[str, Any]],
        summary: str,
        updated_at: str,
        score_impact: float = 0.0,
        score_ripple: float = 0.0,
        score_resonance: float = 0.0,
        final_score: float = 0.0,
    ) -> None:
        """Insert/update country category news."""
        if not self.configured:
            print("[Mongo] upsert_country_news skipped — MONGO_URI not set")
            return
            
        doc_id = f"{country}_{category}"
        await self._db()["country_category_news"].update_one(
            {"_id": doc_id},
            {"$set": {
                "_id": doc_id,
                "country": country,
                "category": category,
                "links": links,
                "articles": articles,
                "summary": summary,
                "score_impact": score_impact,
                "score_ripple": score_ripple,
                "score_resonance": score_resonance,
                "final_score": final_score,
                "updated_at": updated_at,
            }},
            upsert=True,
        )
        print(f"[Mongo] upserted {country}/{category} final_score={final_score}")

    async def patch_country_scores(
        self,
        country: str,
        category: str,
        score_impact: float,
        score_ripple: float,
        score_resonance: float,
        final_score: float,
    ) -> None:
        """Update scores for a country/category."""
        if not self.configured:
            return
            
        doc_id = f"{country}_{category}"
        await self._db()["country_category_news"].update_one(
            {"_id": doc_id},
            {"$set": {
                "score_impact": score_impact,
                "score_ripple": score_ripple,
                "score_resonance": score_resonance,
                "final_score": final_score,
            }},
        )
        print(f"[Mongo] patched scores for {country}/{category} final_score={final_score}")