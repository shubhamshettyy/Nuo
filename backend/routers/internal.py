from datetime import datetime, timezone
from typing import Any

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


class CountryUpsertPayload(BaseModel):
    countries: dict[str, dict[str, Any]]
    snapshots: list[dict[str, Any]] = []


class QuarantinePayload(BaseModel):
    documents: list[dict[str, Any]]


class CountryNewsPayload(BaseModel):
    country: str
    category: str
    links: list[str]
    articles: list[dict[str, Any]] = []
    summary: str
    score_impact: float = 0.0
    score_ripple: float = 0.0
    score_resonance: float = 0.0
    final_score: float = 0.0
    updated_at: str


router = APIRouter(tags=["internal"])
mongo = MongoDataApiService()
settings = get_settings()


def _check_secret(secret: str):
    if settings.internal_webhook_secret and secret != settings.internal_webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid secret")


@router.post("/internal/alert")
async def receive_alert(payload: AlertPayload, x_webhook_secret: str = Header(default="")):
    _check_secret(x_webhook_secret)
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


@router.post("/internal/countries")
async def upsert_countries(payload: CountryUpsertPayload, x_webhook_secret: str = Header(default="")):
    _check_secret(x_webhook_secret)
    await mongo.upsert_countries(payload.countries, payload.snapshots)
    return {"ok": True, "count": len(payload.countries)}


@router.post("/internal/quarantine")
async def log_quarantine(payload: QuarantinePayload, x_webhook_secret: str = Header(default="")):
    _check_secret(x_webhook_secret)
    await mongo.insert_quarantine(payload.documents)
    return {"ok": True}


@router.post("/internal/country-news")
async def receive_country_news(payload: CountryNewsPayload, x_webhook_secret: str = Header(default="")):
    _check_secret(x_webhook_secret)
    await mongo.upsert_country_news(
        payload.country, payload.category, payload.links, payload.articles,
        payload.summary, payload.updated_at,
        payload.score_impact, payload.score_ripple, payload.score_resonance, payload.final_score,
    )
    return {"ok": True}


class CountryScoresPayload(BaseModel):
    country: str
    category: str
    score_impact: float
    score_ripple: float
    score_resonance: float
    final_score: float


@router.patch("/internal/country-news/scores")
async def patch_country_scores(payload: CountryScoresPayload, x_webhook_secret: str = Header(default="")):
    _check_secret(x_webhook_secret)
    await mongo.patch_country_scores(
        payload.country, payload.category,
        payload.score_impact, payload.score_ripple, payload.score_resonance, payload.final_score,
    )
    return {"ok": True}


@router.get("/api/alerts/latest")
async def latest_alerts():
    return {"alerts": await mongo.latest_alerts()}
