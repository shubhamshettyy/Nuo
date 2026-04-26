import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env")

import requests
from uagents import Agent, Context

from agents.shared.models import CurrentsRequest, CurrentsResponse

CURRENTS_API_KEY  = os.getenv("CURRENTS_API_KEY", "")
CURRENTS_BASE_URL = "https://api.currentsapi.services/v2/search"
MAX_ARTICLES      = 8

_port = int(os.getenv("CURRENTS_AGENT_PORT", "8008"))
agent = Agent(
    name="vigil_currents_agent",
    seed=os.getenv("CURRENTS_AGENT_SEED", "vigil-currents-agent-seed"),
    port=_port,
    endpoint=[f"http://127.0.0.1:{_port}/submit"],
)


@agent.on_message(model=CurrentsRequest)
async def handle(ctx: Context, sender: str, msg: CurrentsRequest):
    ctx.logger.info(f"[currents] {msg.country_name} / {msg.category_label}")

    articles = []
    if CURRENTS_API_KEY:
        params = {
            "apiKey":    CURRENTS_API_KEY,
            "language":  "en",
            "page_size": MAX_ARTICLES,
        }
        # Always use keywords — free tier rejects country + category combined
        keywords = msg.category_keywords or msg.category_currents
        params["keywords"] = f"{msg.country_name} {keywords}"

        try:
            resp = requests.get(CURRENTS_BASE_URL, params=params, timeout=15)
            resp.raise_for_status()
            articles = resp.json().get("news", []) or []
        except Exception as exc:
            ctx.logger.warning(f"[currents] {msg.country_name}/{msg.category_label} failed: {exc}")

    await ctx.send(sender, CurrentsResponse(
        item_id=msg.item_id,
        articles=[
            {"title": a.get("title", ""), "url": a.get("url", ""), "description": a.get("description", "")}
            for a in articles if a.get("url")
        ],
        cycle_id=msg.cycle_id,
    ))


if __name__ == "__main__":
    agent.run()
