import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env")

from uagents import Agent, Context

from agents.scoring_base import call_gemma
from agents.shared.models import ScoreRequest, ScoreResponse

_port = int(os.getenv("SCORING_IMPACT_PORT", "8005"))
agent = Agent(
    name="vigil_scoring_impact",
    seed=os.getenv("SCORING_IMPACT_SEED", "vigil-scoring-impact-seed"),
    port=_port,
    endpoint=[f"http://127.0.0.1:{_port}/submit"],
)


@agent.on_message(model=ScoreRequest)
async def handle(ctx: Context, sender: str, msg: ScoreRequest):
    import asyncio
    ctx.logger.info(f"[impact] scoring {msg.item_id}")
    loop = asyncio.get_event_loop()
    score = await loop.run_in_executor(None, call_gemma, "impact", msg.country, msg.category, msg.articles, msg.item_id)
    await ctx.send(sender, ScoreResponse(
        item_id=msg.item_id,
        agent_type="impact",
        score=score,
        cycle_id=msg.cycle_id,
    ))


if __name__ == "__main__":
    agent.run()
