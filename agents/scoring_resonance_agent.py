import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env")

from uagents import Agent, Context

from agents.scoring_base import call_gemma
from agents.shared.models import ScoreRequest, ScoreResponse

_port = int(os.getenv("SCORING_RESONANCE_PORT", "8007"))
agent = Agent(
    name="vigil_scoring_resonance",
    seed=os.getenv("SCORING_RESONANCE_SEED", "vigil-scoring-resonance-seed"),
    port=_port,
    endpoint=[f"http://127.0.0.1:{_port}/submit"],
)


@agent.on_message(model=ScoreRequest)
async def handle(ctx: Context, sender: str, msg: ScoreRequest):
    ctx.logger.info(f"[resonance] scoring {msg.item_id}")
    score = call_gemma("resonance", msg.country, msg.category, msg.articles, msg.item_id)
    await ctx.send(sender, ScoreResponse(
        item_id=msg.item_id,
        agent_type="resonance",
        score=score,
        cycle_id=msg.cycle_id,
    ))


if __name__ == "__main__":
    agent.run()
