import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env")

import trafilatura
from uagents import Agent, Context

from agents.shared.models import TrafilaturaRequest, TrafilaturaResponse

_port = int(os.getenv("TRAFILATURA_AGENT_PORT", "8009"))
agent = Agent(
    name="vigil_trafilatura_agent",
    seed=os.getenv("TRAFILATURA_AGENT_SEED", "vigil-trafilatura-agent-seed"),
    port=_port,
    endpoint=[f"http://127.0.0.1:{_port}/submit"],
)


def _fetch(url: str) -> str:
    try:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return ""
        text = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
        return (text or "")[:8000]
    except Exception:
        return ""


def _fetch_all(articles: list) -> list:
    return [
        {"title": a.get("title", ""), "url": a.get("url", ""), "content": _fetch(a.get("url", "")) or a.get("description", "")}
        for a in articles
    ]


@agent.on_message(model=TrafilaturaRequest)
async def handle(ctx: Context, sender: str, msg: TrafilaturaRequest):
    import asyncio
    ctx.logger.info(f"[trafilatura] fetching {len(msg.articles)} URLs for {msg.item_id}")
    loop = asyncio.get_event_loop()
    enriched = await loop.run_in_executor(None, _fetch_all, msg.articles)
    await ctx.send(sender, TrafilaturaResponse(
        item_id=msg.item_id,
        articles=enriched,
        cycle_id=msg.cycle_id,
    ))


if __name__ == "__main__":
    agent.run()
