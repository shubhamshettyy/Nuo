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
        print(f"[Globe] Sample country: {sample}")
    
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
    
    print(f"[Globe] Retrieved details for {iso3}: index={details.get('index_value')}")
    return details


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