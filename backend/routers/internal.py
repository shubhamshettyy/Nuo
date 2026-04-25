from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

try:
    from backend.config import get_settings
    from backend.services.mongo_service import MongoDataApiService
except ModuleNotFoundError:
    from config import get_settings
    from services.mongo_service import MongoDataApiService


class AlertPayload(BaseModel):
    country_code: str
    previous_score: float
    new_score: float
    delta: float
    cycle_id: str


router = APIRouter(tags=["internal"])
mongo = MongoDataApiService()
settings = get_settings()


@router.post("/internal/alert")
async def receive_alert(payload: AlertPayload, x_webhook_secret: str = Header(default="")):
    if settings.internal_webhook_secret and x_webhook_secret != settings.internal_webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid secret")

    alert_doc = {
        "country_code": payload.country_code,
        "previous_score": payload.previous_score,
        "new_score": payload.new_score,
        "delta": payload.delta,
        "cycle_id": payload.cycle_id,
        "fired_at": datetime.now(timezone.utc).isoformat(),
    }
    await mongo.insert_alert(alert_doc)
    return {"ok": True}


@router.get("/api/alerts/latest")
async def latest_alerts():
    return {"alerts": await mongo.latest_alerts()}
