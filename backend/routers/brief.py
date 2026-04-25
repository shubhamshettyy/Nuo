from fastapi import APIRouter, HTTPException

try:
    from backend.services.claude_service import ClaudeService
    from backend.services.mongo_service import MongoDataApiService
except ModuleNotFoundError:
    from services.claude_service import ClaudeService
    from services.mongo_service import MongoDataApiService

router = APIRouter(prefix="/api", tags=["brief"])
mongo = MongoDataApiService()
claude = ClaudeService()


@router.post("/country/{iso3}/brief")
async def generate_brief(iso3: str):
    doc = await mongo.get_country(iso3)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Country {iso3.upper()} not found")

    brief_text = await claude.generate_country_brief(doc)
    return {
        "iso3": doc.get("_id", iso3.upper()),
        "name": doc.get("name", iso3.upper()),
        "invisible_index": doc.get("invisible_index", 0),
        "brief_text": brief_text,
        "audio_url": None,
    }
