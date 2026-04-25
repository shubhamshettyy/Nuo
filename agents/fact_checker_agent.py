import datetime
import json
import os

import requests
from uagents import Agent, Context

from agents.shared.models import RawDataPayload, VerifiedIndexUpdate

HISTORICAL_MAX_INDEX = 80000.0
MAX_CYCLE_MULTIPLIER = 5.0
MIN_GLOBAL_ARTICLES = 1

ALERT_AGENT_ADDRESS = os.getenv("ALERT_AGENT_ADDRESS", "")
BACKEND_URL = os.getenv("BACKEND_URL", "")
INTERNAL_WEBHOOK_SECRET = os.getenv("INTERNAL_WEBHOOK_SECRET", "")

agent = Agent(name="vigil_fact_checker", seed=os.getenv("FACT_CHECKER_SEED", "vigil-fact-checker-seed"), port=int(os.getenv("AGENT_PORT", "8001")))


@agent.on_message(model=RawDataPayload)
async def fact_check(ctx: Context, sender: str, msg: RawDataPayload):
    raw_last = ctx.storage.get("last_verified_scores")
    last_scores = json.loads(raw_last) if raw_last else {}
    total_filtered = sum(msg.article_counts_filtered.values())
    if total_filtered < MIN_GLOBAL_ARTICLES:
        ctx.logger.warning(f"Rejected cycle {msg.cycle_id}: total filtered articles too low ({total_filtered})")
        return

    verified = {}
    quarantined = []
    for country, score in msg.countries.items():
        reasons = []
        if score > HISTORICAL_MAX_INDEX:
            reasons.append("exceeded historical maximum")
        previous = last_scores.get(country)
        if previous and previous > 0:
            ratio = score / previous
            if ratio > MAX_CYCLE_MULTIPLIER or ratio < (1 / MAX_CYCLE_MULTIPLIER):
                reasons.append("cycle-over-cycle ratio spike")
        if reasons:
            quarantined.append({"country": country, "score": score, "last_known_good": previous, "reasons": reasons})
            if previous is not None:
                verified[country] = previous
        else:
            verified[country] = score

    if quarantined and BACKEND_URL:
        docs = [
            {
                "cycle_id": msg.cycle_id,
                "country_code": item["country"],
                "rejected_score": item["score"],
                "last_known_good_score": item["last_known_good"],
                "reasons": item["reasons"],
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            }
            for item in quarantined
        ]
        try:
            requests.post(
                f"{BACKEND_URL}/internal/quarantine",
                headers={"Content-Type": "application/json", "X-Webhook-Secret": INTERNAL_WEBHOOK_SECRET},
                json={"documents": docs},
                timeout=8,
            )
        except Exception as exc:
            ctx.logger.warning(f"Quarantine write failed: {exc}")

    ctx.storage.set("last_verified_scores", json.dumps(verified))
    if ALERT_AGENT_ADDRESS:
        await ctx.send(
            ALERT_AGENT_ADDRESS,
            VerifiedIndexUpdate(countries=verified, quarantined=[q["country"] for q in quarantined], cycle_id=msg.cycle_id),
        )


if __name__ == "__main__":
    agent.run()
