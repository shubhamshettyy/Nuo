from fastapi import APIRouter

try:
    from backend.services.mongo_service import MongoDataApiService
except ModuleNotFoundError:
    from services.mongo_service import MongoDataApiService

router = APIRouter(prefix="/api", tags=["globe"])
mongo = MongoDataApiService()


@router.get("/globe")
async def get_globe():
    return await mongo.get_countries()


@router.get("/country/{iso3}")
async def get_country(iso3: str):
    return await mongo.get_country(iso3)
