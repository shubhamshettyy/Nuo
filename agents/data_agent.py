import datetime
import json
import os
from collections import defaultdict
from typing import Dict, List

import requests
from uagents import Agent, Context

from agents.shared.models import RawDataPayload

FACT_CHECKER_ADDRESS = os.getenv("FACT_CHECKER_AGENT_ADDRESS", "")
MONGO_DATA_API_URL = os.getenv("MONGO_DATA_API_URL", "")
MONGO_DATA_API_KEY = os.getenv("MONGO_DATA_API_KEY", "")
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "vigil")
MONGO_DATASOURCE = os.getenv("MONGO_DATASOURCE", "Cluster0")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

ALL_COUNTRIES = ["AGO", "TCD", "COD", "SDN", "ETH", "AFG", "HTI", "YEM"]

agent = Agent(name="vigil_data_agent", seed=os.getenv("DATA_AGENT_SEED", "vigil-data-agent-seed"))


def fetch_gdelt_articles() -> List[dict]:
    base = os.getenv("GDELT_BASE_URL", "https://api.gdeltproject.org/api/v2/doc/doc")
    params = {
        "query": "humanitarian crisis OR famine OR conflict OR displacement OR outbreak",
        "mode": "ArtList",
        "maxrecords": 250,
        "format": "json",
        "timespan": "15min",
        "sort": "DateDesc",
    }
    try:
        resp = requests.get(base, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json().get("articles", []) or []
    except Exception:
        return []


def classify_articles(articles: List[dict]) -> Dict[str, int]:
    if not articles:
        return {}
    counts = defaultdict(int)
    for article in articles[:250]:
        iso3 = (article.get("sourcecountry") or article.get("country_code") or "").upper()
        if len(iso3) == 3 and iso3.isalpha():
            counts[iso3] += 1
    return dict(counts)


def fetch_acled_data() -> Dict[str, dict]:
    return {"SDN": {"fatalities": 500, "events": 30}, "COD": {"fatalities": 120, "events": 12}}


def fetch_unhcr_data() -> Dict[str, int]:
    return {"SDN": 9100000, "TCD": 5200000, "AGO": 7300000}


def fetch_who_outbreaks() -> Dict[str, int]:
    return {"SDN": 2, "AGO": 1}


def compute_invisible_index(
    acled: Dict[str, dict],
    unhcr: Dict[str, int],
    who: Dict[str, int],
    gdelt_filtered: Dict[str, int],
    gdelt_raw: Dict[str, int],
    all_countries: List[str],
) -> Dict[str, dict]:
    computed = {}
    for iso3 in all_countries:
        acled_entry = acled.get(iso3, {})
        fatalities = int(acled_entry.get("fatalities", 0))
        events = int(acled_entry.get("events", 0))
        displaced = int(unhcr.get(iso3, 0))
        outbreaks = int(who.get(iso3, 0))
        filtered_count = int(gdelt_filtered.get(iso3, 0))
        raw_count = int(gdelt_raw.get(iso3, 0))

        suffering = (fatalities * 10) + (events * 5) + (displaced / 1000.0) + (outbreaks * 500)
        attention = max(float(filtered_count), 0.001)
        index = 0.0 if suffering == 0 else suffering / attention

        computed[iso3] = {
            "invisible_index": round(index, 2),
            "suffering_score": round(suffering, 2),
            "attention_score": round(attention, 3),
            "article_count_raw": raw_count,
            "article_count_filtered": filtered_count,
            "conflict_events": events,
            "displaced_persons": displaced,
            "disease_outbreaks": outbreaks,
        }
    return computed


def write_to_mongo(computed: Dict[str, dict], cycle_id: str) -> None:
    if not MONGO_DATA_API_URL or not MONGO_DATA_API_KEY:
        return
    headers = {"api-key": MONGO_DATA_API_KEY, "Content-Type": "application/json"}
    ts = datetime.datetime.utcnow().isoformat() + "Z"
    for iso3, item in computed.items():
        payload = {
            "collection": "countries",
            "database": MONGO_DATABASE,
            "dataSource": MONGO_DATASOURCE,
            "filter": {"_id": iso3},
            "update": {"$set": {"_id": iso3, "last_updated": ts, **item}},
            "upsert": True,
        }
        requests.post(f"{MONGO_DATA_API_URL}/action/updateOne", headers=headers, json=payload, timeout=8)
    snapshots = [
        {
            "country_code": iso3,
            "invisible_index": item["invisible_index"],
            "suffering_score": item["suffering_score"],
            "attention_score": item["attention_score"],
            "timestamp": ts,
            "cycle_id": cycle_id,
        }
        for iso3, item in computed.items()
    ]
    requests.post(
        f"{MONGO_DATA_API_URL}/action/insertMany",
        headers=headers,
        json={
            "collection": "index_snapshots",
            "database": MONGO_DATABASE,
            "dataSource": MONGO_DATASOURCE,
            "documents": snapshots,
        },
        timeout=8,
    )


@agent.on_interval(period=900.0)
async def update_globe(ctx: Context):
    cycle_id = datetime.datetime.utcnow().strftime("%Y%m%d-%H%M")
    articles = fetch_gdelt_articles()
    gdelt_filtered = classify_articles(articles)
    gdelt_raw = defaultdict(int)
    for article in articles:
        iso3 = (article.get("sourcecountry") or article.get("country_code") or "").upper()
        if len(iso3) == 3:
            gdelt_raw[iso3] += 1

    computed = compute_invisible_index(
        fetch_acled_data(),
        fetch_unhcr_data(),
        fetch_who_outbreaks(),
        gdelt_filtered,
        dict(gdelt_raw),
        ALL_COUNTRIES,
    )
    write_to_mongo(computed, cycle_id)

    if FACT_CHECKER_ADDRESS:
        payload = RawDataPayload(
            countries={k: v["invisible_index"] for k, v in computed.items()},
            article_counts_raw={k: v["article_count_raw"] for k, v in computed.items()},
            article_counts_filtered={k: v["article_count_filtered"] for k, v in computed.items()},
            suffering_scores={k: v["suffering_score"] for k, v in computed.items()},
            attention_scores={k: v["attention_score"] for k, v in computed.items()},
            cycle_id=cycle_id,
        )
        await ctx.send(FACT_CHECKER_ADDRESS, payload)
    else:
        ctx.logger.info(f"{cycle_id}: Fact checker address missing, skipped send.")


if __name__ == "__main__":
    agent.run()
