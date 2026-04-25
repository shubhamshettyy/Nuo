import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx

try:
    from backend.config import get_settings
except ModuleNotFoundError:
    from config import get_settings


class MongoDataApiService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._mock_cache: dict[str, Any] | None = None
        self._mock_cache_loaded_at: datetime | None = None

    @property
    def configured(self) -> bool:
        return bool(self.settings.mongo_data_api_url and self.settings.mongo_data_api_key)

    def _headers(self) -> dict[str, str]:
        return {
            "api-key": self.settings.mongo_data_api_key,
            "Content-Type": "application/json",
        }

    def _base_payload(self, collection: str) -> dict[str, str]:
        return {
            "collection": collection,
            "database": self.settings.mongo_database,
            "dataSource": self.settings.mongo_datasource,
        }

    async def _post(self, action: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not self.configured:
            return {}
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{self.settings.mongo_data_api_url}/action/{action}",
                headers=self._headers(),
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    def _mock_data(self) -> dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        path = Path(__file__).resolve().parents[1] / "data" / "mock_countries.json"
        if not path.exists():
            return {"updated_at": now, "countries": [], "alerts": []}

        if self._mock_cache and self._mock_cache_loaded_at and datetime.now(timezone.utc) - self._mock_cache_loaded_at < timedelta(seconds=60):
            return self._mock_cache

        data = json.loads(path.read_text(encoding="utf-8"))
        data["updated_at"] = now
        self._mock_cache = data
        self._mock_cache_loaded_at = datetime.now(timezone.utc)
        return data

    async def get_countries(self) -> dict[str, Any]:
        if not self.configured:
            return self._mock_data()

        payload = self._base_payload("countries")
        payload.update(
            {
                "filter": {},
                "projection": {
                    "_id": 1,
                    "name": 1,
                    "lat": 1,
                    "lng": 1,
                    "invisible_index": 1,
                    "suffering_score": 1,
                    "attention_score": 1,
                    "displaced_persons": 1,
                    "conflict_events": 1,
                    "article_count_filtered": 1,
                    "last_updated": 1,
                },
                "limit": 300,
            }
        )
        result = await self._post("find", payload)
        docs = result.get("documents", [])
        return {"updated_at": datetime.now(timezone.utc).isoformat(), "countries": docs}

    async def get_country(self, iso3: str) -> dict[str, Any]:
        if not self.configured:
            for item in self._mock_data()["countries"]:
                if item.get("_id") == iso3.upper():
                    return item
            return {}
        payload = self._base_payload("countries")
        payload.update({"filter": {"_id": iso3.upper()}})
        result = await self._post("findOne", payload)
        return result.get("document") or {}

    async def latest_alerts(self) -> list[dict[str, Any]]:
        if not self.configured:
            return self._mock_data().get("alerts", [])
        payload = self._base_payload("alert_log")
        payload.update({"sort": {"fired_at": -1}, "limit": 10})
        result = await self._post("find", payload)
        return result.get("documents", [])

    async def insert_alert(self, payload_data: dict[str, Any]) -> None:
        if not self.configured:
            return
        payload = self._base_payload("alert_log")
        payload.update({"document": payload_data})
        await self._post("insertOne", payload)
