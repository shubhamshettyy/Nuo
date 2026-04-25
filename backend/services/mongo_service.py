import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

try:
    from backend.config import get_settings
except ModuleNotFoundError:
    from config import get_settings

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
            return self._mock_data()

        projection = {
            "_id": 1, "name": 1, "lat": 1, "lng": 1,
            "invisible_index": 1, "suffering_score": 1, "attention_score": 1,
            "displaced_persons": 1, "conflict_events": 1,
            "article_count_filtered": 1, "last_updated": 1,
        }
        cursor = self._db()["countries"].find({}, projection).limit(300)
        docs = await cursor.to_list(length=300)
        return {"updated_at": datetime.now(timezone.utc).isoformat(), "countries": docs}

    async def get_country(self, iso3: str) -> dict[str, Any]:
        if not self.configured:
            for item in self._mock_data()["countries"]:
                if item.get("_id") == iso3.upper():
                    return item
            return {}

        doc = await self._db()["countries"].find_one({"_id": iso3.upper()})
        return doc or {}

    async def latest_alerts(self) -> list[dict[str, Any]]:
        if not self.configured:
            return self._mock_data().get("alerts", [])

        cursor = self._db()["alert_log"].find({}).sort("fired_at", -1).limit(10)
        return await cursor.to_list(length=10)

    async def insert_alert(self, payload_data: dict[str, Any]) -> None:
        if not self.configured:
            return
        await self._db()["alert_log"].insert_one(payload_data)

    async def upsert_countries(self, countries: dict[str, Any], snapshots: list[dict[str, Any]]) -> None:
        if not self.configured:
            return
        from datetime import datetime, timezone
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
