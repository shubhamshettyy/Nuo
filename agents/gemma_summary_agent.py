import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env")

from google import genai
from uagents import Agent, Context

from agents.shared.models import SummaryRequest, SummaryResponse

GEMMA_API_KEY = os.getenv("GEMMA_API_KEY", "")
GEMMA_MODEL   = "gemma-4-31b-it"
_client       = genai.Client(api_key=GEMMA_API_KEY) if GEMMA_API_KEY else None

_port = int(os.getenv("GEMMA_SUMMARY_PORT", "8010"))
agent = Agent(
    name="vigil_gemma_summary_agent",
    seed=os.getenv("GEMMA_SUMMARY_SEED", "vigil-gemma-summary-seed"),
    port=_port,
    endpoint=[f"http://127.0.0.1:{_port}/submit"],
)


def _summarize(country: str, category: str, articles: list[dict]) -> str:
    if not _client:
        return ""

    blocks = [
        f"[Article {i}] {a.get('title', '')}\n{a.get('content', '')}"
        for i, a in enumerate(articles, 1)
        if a.get("content")
    ]
    if not blocks:
        return ""

    prompt = (
        f"You are summarizing news coverage about {country} under the topic: {category}.\n\n"
        f"Below are {len(blocks)} news article(s). Write a single coherent summary (50-60 words) "
        f"describing what is currently happening in {country} related to {category}. "
        f"Be factual, specific, and cite numbers where present.\n\n"
        + "\n\n---\n\n".join(blocks)
    )

    import time
    for attempt in range(6):
        try:
            response = _client.models.generate_content(model=GEMMA_MODEL, contents=prompt)
            return response.text.strip()
        except Exception as exc:
            msg = str(exc)
            if "429" in msg or "RESOURCE_EXHAUSTED" in msg or "quota" in msg.lower():
                wait = 30 * (2 ** attempt)
                print(f"[gemma-summary] rate limited — waiting {wait}s")
                time.sleep(wait)
            else:
                print(f"[gemma-summary] failed: {exc}")
                return ""
    return ""


@agent.on_message(model=SummaryRequest)
async def handle(ctx: Context, sender: str, msg: SummaryRequest):
    import asyncio
    ctx.logger.info(f"[gemma-summary] summarizing {msg.item_id}")
    loop = asyncio.get_event_loop()
    summary = await loop.run_in_executor(None, _summarize, msg.country, msg.category, msg.articles)
    await ctx.send(sender, SummaryResponse(
        item_id=msg.item_id,
        summary=summary,
        cycle_id=msg.cycle_id,
    ))


if __name__ == "__main__":
    agent.run()
