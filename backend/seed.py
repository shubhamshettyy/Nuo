import asyncio
import json
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb+srv://lahacks2026:Bc2DvPdcg7Ad3XtE@cluster0.gfud4dq.mongodb.net/?appName=Cluster0"
DB_NAME = "vigil"

async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    path = Path(__file__).parent / "data" / "mock_countries.json"
    data = json.loads(path.read_text())

    countries = data["countries"]
    alerts = data.get("alerts", [])

    col = db["countries"]
    await col.delete_many({})
    await col.insert_many(countries)
    print(f"Inserted {len(countries)} countries")

    if alerts:
        alert_col = db["alert_log"]
        await alert_col.delete_many({})
        await alert_col.insert_many(alerts)
        print(f"Inserted {len(alerts)} alerts")

    client.close()

asyncio.run(seed())
