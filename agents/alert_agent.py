import json
import os

import requests
from uagents import Agent, Context

from agents.shared.models import VerifiedIndexUpdate

SPIKE_THRESHOLD_ABSOLUTE = 3000.0
SPIKE_THRESHOLD_RELATIVE = 2.0

BACKEND_URL = os.getenv("BACKEND_URL", "")
INTERNAL_WEBHOOK_SECRET = os.getenv("INTERNAL_WEBHOOK_SECRET", "")

agent = Agent(name="vigil_alert_agent", seed=os.getenv("ALERT_AGENT_SEED", "vigil-alert-agent-seed"), port=int(os.getenv("AGENT_PORT", "8002")))


@agent.on_message(model=VerifiedIndexUpdate)
async def handle_verified_update(ctx: Context, sender: str, msg: VerifiedIndexUpdate):
    raw_last = ctx.storage.get("last_scores")
    last_scores = json.loads(raw_last) if raw_last else {}

    spikes = []
    for country, new_score in msg.countries.items():
        old_score = float(last_scores.get(country, 0))
        delta = new_score - old_score
        relative_change = (new_score / old_score) if old_score > 0 else float("inf")
        if delta >= SPIKE_THRESHOLD_ABSOLUTE and relative_change >= SPIKE_THRESHOLD_RELATIVE:
            spikes.append(
                {
                    "country_code": country,
                    "previous_score": old_score,
                    "new_score": new_score,
                    "delta": delta,
                    "cycle_id": msg.cycle_id,
                }
            )

    ctx.storage.set("last_scores", json.dumps(msg.countries))
    if BACKEND_URL:
        for spike in spikes:
            try:
                requests.post(
                    f"{BACKEND_URL}/internal/alert",
                    headers={"Content-Type": "application/json", "X-Webhook-Secret": INTERNAL_WEBHOOK_SECRET},
                    json=spike,
                    timeout=8,
                )
            except Exception as exc:
                ctx.logger.warning(f"Alert webhook failed for {spike['country_code']}: {exc}")


if __name__ == "__main__":
    agent.run()
