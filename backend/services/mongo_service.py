import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

try:
    from backend.config import get_settings
except ModuleNotFoundError:
    from config import get_settings


def _normalize_country(doc: dict[str, Any]) -> dict[str, Any]:
    """Map backend DB fields to the shape the frontend expects."""
    return {
        "iso3": doc.get("_id", ""),
        "name": doc.get("name", ""),
        "index_value": doc.get("invisible_index", 0),
        "latitude": doc.get("lat", 0),
        "longitude": doc.get("lng", 0),
        "suffering_score": doc.get("suffering_score", 0),
        "attention_score": doc.get("attention_score", 0),
        "displaced_persons": doc.get("displaced_persons", 0),
        "conflict_events": doc.get("conflict_events", 0),
        "article_count_filtered": doc.get("article_count_filtered", 0),
        "last_updated": doc.get("last_updated", ""),
    }


def _build_details(doc: dict[str, Any]) -> dict[str, Any]:
    """Derive a detail-view payload from a country document."""
    iso3 = doc.get("_id", doc.get("iso3", ""))
    index_value = doc.get("invisible_index", doc.get("index_value", 0))
    attention = doc.get("attention_score", 0.5)
    conflict = doc.get("conflict_events", 0)
    displaced = doc.get("displaced_persons", 0)
    articles = doc.get("article_count_filtered", 0)

    misinformation_score = min(100, round(index_value * 0.9 + (1 - attention) * 10))
    bot_activity = min(100, round(index_value * 0.75 + random.uniform(-3, 3)))
    fact_check_ratio = max(5, round(100 - index_value * 0.7 + attention * 15))
    source_diversity = max(5, round(100 - index_value * 0.65 + articles * 0.5))

    if index_value > 70:
        trend = "up"
        change_24h = round(random.uniform(0.5, 3.5), 1)
    elif index_value < 35:
        trend = "down"
        change_24h = round(random.uniform(-2.5, -0.2), 1)
    else:
        trend = "stable"
        change_24h = round(random.uniform(-1.5, 1.5), 1)

    return {
        "iso3": iso3,
        "name": doc.get("name", ""),
        "index_value": index_value,
        "trend": trend,
        "change_24h": change_24h,
        "last_updated": doc.get("last_updated", datetime.now(timezone.utc).isoformat()),
        "metrics": {
            "misinformation_score": misinformation_score,
            "bot_activity": bot_activity,
            "fact_check_ratio": fact_check_ratio,
            "source_diversity": source_diversity,
        },
        "trending_topics": [],
        "news_articles": [],
        "suffering_score": doc.get("suffering_score", 0),
        "attention_score": attention,
        "displaced_persons": displaced,
        "conflict_events": conflict,
        "article_count_filtered": articles,
    }


def _normalize_alert(doc: dict[str, Any]) -> dict[str, Any]:
    """Normalize DB alert doc to the shape the frontend expects."""
    # If already in frontend format (from mock JSON), pass through
    if "country_iso3" in doc:
        return {k: v for k, v in doc.items() if k != "_id"}

    # Map from internal webhook format
    country_code = doc.get("country_code", "")
    delta = doc.get("delta", 0)
    new_score = doc.get("new_score", 0)
    severity = "critical" if delta > 5000 else "high" if delta > 1000 else "medium"
    return {
        "country_iso3": country_code,
        "country_name": doc.get("country_name", country_code),
        "message": f"Index spike: +{delta:.0f} points (new score: {new_score:.0f})",
        "timestamp": doc.get("fired_at", datetime.now(timezone.utc).isoformat()),
        "severity": severity,
    }


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
        self._mock_cache_loaded_at: datetime | None = None

    @property
    def configured(self) -> bool:
        return bool(self.settings.mongo_uri)

    def _db(self):
        return _get_client()[self.settings.mongo_database]

    def _mock_data(self) -> dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        path = Path(__file__).resolve().parents[1] / "data" / "mock_countries.json"
        if not path.exists():
            return {"updated_at": now, "countries": [], "alerts": []}

        if (
            self._mock_cache
            and self._mock_cache_loaded_at
            and datetime.now(timezone.utc) - self._mock_cache_loaded_at < timedelta(seconds=60)
        ):
            return self._mock_cache

        data = json.loads(path.read_text(encoding="utf-8"))
        data["updated_at"] = now
        self._mock_cache = data
        self._mock_cache_loaded_at = datetime.now(timezone.utc)
        return data

    async def get_countries(self) -> dict[str, Any]:
        if not self.configured:
            mock = self._mock_data()
            return {
                "updated_at": mock["updated_at"],
                "countries": [_normalize_country(c) for c in mock["countries"]],
            }

        projection = {
            "_id": 1, "name": 1, "lat": 1, "lng": 1,
            "invisible_index": 1, "suffering_score": 1, "attention_score": 1,
            "displaced_persons": 1, "conflict_events": 1,
            "article_count_filtered": 1, "last_updated": 1,
        }
        cursor = self._db()["countries"].find({}, projection).limit(300)
        docs = await cursor.to_list(length=300)
        return {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "countries": [_normalize_country(d) for d in docs],
        }

    async def get_country(self, iso3: str) -> dict[str, Any]:
        if not self.configured:
            for item in self._mock_data()["countries"]:
                if item.get("_id") == iso3.upper():
                    return _normalize_country(item)
            return {}

        doc = await self._db()["countries"].find_one({"_id": iso3.upper()})
        return _normalize_country(doc) if doc else {}

    async def get_country_details(self, iso3: str) -> dict[str, Any]:
        if not self.configured:
            for item in self._mock_data()["countries"]:
                if item.get("_id") == iso3.upper():
                    return _build_details(item)
            return {}

        doc = await self._db()["countries"].find_one({"_id": iso3.upper()})
        return _build_details(doc) if doc else {}

    async def latest_alerts(self) -> list[dict[str, Any]]:
        if not self.configured:
            return [_normalize_alert(a) for a in self._mock_data().get("alerts", [])]

        cursor = self._db()["alert_log"].find({}).sort("fired_at", -1).limit(10)
        docs = await cursor.to_list(length=10)
        return [_normalize_alert(d) for d in docs]

    async def insert_alert(self, payload_data: dict[str, Any]) -> None:
        if not self.configured:
            return
        await self._db()["alert_log"].insert_one(payload_data)

    async def upsert_countries(self, countries: dict[str, Any], snapshots: list[dict[str, Any]]) -> None:
        if not self.configured:
            return
        ts = datetime.now(timezone.utc).isoformat()
        for iso3, data in countries.items():
            await self._db()["countries"].update_one(
                {"_id": iso3},
                {"$set": {"_id": iso3, "last_updated": ts, **data}},
                upsert=True,
            )
        if snapshots:
            await self._db()["index_snapshots"].insert_many(snapshots)

    async def insert_quarantine(self, documents: list[dict[str, Any]]) -> None:
        if not self.configured or not documents:
            return
        await self._db()["quarantine_log"].insert_many(documents)
