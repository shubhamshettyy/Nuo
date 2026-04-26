from fastapi import APIRouter, HTTPException

try:
    from backend.services.mongo_service import MongoDataApiService
    from backend.utils.country_mappings import ISO3_TO_NAME
except ModuleNotFoundError:
    from services.mongo_service import MongoDataApiService
    from utils.country_mappings import ISO3_TO_NAME

router = APIRouter(prefix="/api", tags=["globe"])
mongo = MongoDataApiService()


@router.get("/globe")
async def get_globe():
    """Get all countries with their integrity index values."""
    result = await mongo.get_countries()
    
    # Debug logging
    print(f"[Globe] Returned {len(result.get('countries', []))} countries")
    if result.get('countries'):
        sample = result['countries'][0]
        print(f"[Globe] Sample country: {sample.get('name')} - Index: {sample.get('index_value')}")
    
    return result


@router.get("/country/{iso3}")
async def get_country(iso3: str):
    """Get basic country info by ISO3 code."""
    country = await mongo.get_country(iso3)
    
    if not country:
        raise HTTPException(status_code=404, detail=f"Country {iso3} not found")
    
    print(f"[Globe] Retrieved country {iso3}: {country.get('name')}")
    return country


@router.get("/country/{iso3}/details")
async def get_country_details(iso3: str):
    """Get detailed country metrics, trending topics, and news articles."""
    details = await mongo.get_country_details(iso3)
    
    if not details:
        raise HTTPException(status_code=404, detail=f"Country details for {iso3} not found")
    
    print(f"[Globe] Retrieved details for {iso3}: index={details.get('index_value')}, articles={len(details.get('news_articles', []))}")
    return details


@router.get("/country/{iso3}/articles")
async def get_country_articles(iso3: str):
    """
    Get ALL articles for a country across all categories.
    This is what the sidebar will use to display news.
    """
    country_name = ISO3_TO_NAME.get(iso3.upper())
    
    if not country_name:
        raise HTTPException(status_code=404, detail=f"Country {iso3} not found in mapping")
    
    # Get all category data
    categories = await mongo.get_country_news(country_name)
    
    if not categories:
        return {
            "iso3": iso3.upper(),
            "country": country_name,
            "total_articles": 0,
            "articles": [],
            "categories_with_articles": []
        }
    
    # Extract all articles from all categories
    all_articles = []
    article_id = 1
    categories_with_articles = []
    
    for cat in categories:
        articles = cat.get("articles", [])
        if not articles:
            continue
            
        categories_with_articles.append({
            "category": cat["category"],
            "article_count": len(articles),
            "final_score": cat.get("final_score", 0),
            "summary": cat.get("summary", ""),
        })
        
        for article in articles:
            # Skip if no title
            if not article.get("title"):
                continue
                
            all_articles.append({
                "id": article_id,
                "title": article.get("title", ""),
                "url": article.get("url", ""),
                "content": article.get("content", ""),
                "category": cat["category"],
                "published": cat.get("updated_at", ""),
                "credibility": "verified",
                "impact_score": round(cat.get("final_score", 0)),
            })
            article_id += 1
    
    # Sort by impact score (highest first)
    all_articles.sort(key=lambda x: x["impact_score"], reverse=True)
    
    print(f"[Globe] Retrieved {len(all_articles)} articles for {country_name} ({iso3}) across {len(categories_with_articles)} categories")
    
    return {
        "iso3": iso3.upper(),
        "country": country_name,
        "total_articles": len(all_articles),
        "articles": all_articles,
        "categories_with_articles": categories_with_articles,
    }


@router.get("/country/{iso3}/agent-news")
async def get_country_agent_news(iso3: str):
    """
    Get news collected by data agents, organized by category.
    Returns articles + scores for each category.
    """
    country_name = ISO3_TO_NAME.get(iso3.upper())
    
    if not country_name:
        # If not in our mapping, still try with the ISO3 code
        print(f"[Globe] Warning: {iso3} not in ISO3_TO_NAME mapping, trying anyway")
        country_name = iso3.upper()
    
    docs = await mongo.get_country_news(country_name)
    
    print(f"[Globe] Retrieved {len(docs)} categories for {country_name} ({iso3})")
    if docs:
        print(f"[Globe] Categories: {[d.get('category') for d in docs]}")
    
    return {"categories": docs}