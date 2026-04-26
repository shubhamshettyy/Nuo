"""Shared Gemma scoring logic imported by all 3 scoring agents."""

import json
import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env")

from google import genai

GEMMA_API_KEY = os.getenv("GEMMA_API_KEY", "")
GEMMA_MODEL = "gemma-4-31b-it"

_client = genai.Client(api_key=GEMMA_API_KEY) if GEMMA_API_KEY else None

_SCALE = """
Score 0 to infinity using these anchors (decimals encouraged):
  0   → irrelevant to anyone outside the country
  2   → minor interest, niche audience only
  5   → noteworthy, would appear in international news briefly
  8   → significant, sustained global media attention
  12  → major event, affects or moves people worldwide
  20+ → historic, generational-level significance (COVID, moon landing, world war)
"""

PROMPTS = {
    "impact": """\
You are Agent 1 — Human Impact Scorer.

How many people are directly affected, positively or negatively?
This works for both good and bad events — a cure and a famine can both score high.

{scale}

Country: {country}
Category: {category}

News articles:
{articles_block}

Respond with ONLY valid JSON, no extra text: {{"impact_score": <number>}}
""",

    "ripple": """\
You are Agent 2 — Global Ripple Scorer.

Does this cross borders? Does it affect other countries' economies, politics,
migration, environment, or inspire policy changes globally?
Purely internal events with no international spillover score low.

{scale}

Country: {country}
Category: {category}

News articles:
{articles_block}

Respond with ONLY valid JSON, no extra text: {{"ripple_score": <number>}}
""",

    "resonance": """\
You are Agent 3 — Emotional Resonance Scorer.

Would a general outside observer feel strongly — inspired, alarmed, hopeful,
or morally compelled? Works for both positive and negative events.
Bureaucratic or highly technical events that don't move people emotionally score low.

{scale}

Country: {country}
Category: {category}

News articles:
{articles_block}

Respond with ONLY valid JSON, no extra text: {{"resonance_score": <number>}}
""",
}


def build_articles_block(articles: list[dict]) -> str:
    lines = []
    for i, a in enumerate(articles, 1):
        title = a.get("title") or ""
        content = (a.get("content") or a.get("description") or "").strip()
        lines.append(f"[{i}] {title}\n{content[:3000]}")
    return "\n\n---\n\n".join(lines) if lines else "(no article content available)"


def call_gemma(agent_type: str, country: str, category: str, articles: list[dict], item_id: str) -> float:
    if not _client:
        print(f"[{agent_type}] GEMMA_API_KEY not set")
        return 0.0

    block = build_articles_block(articles)
    prompt = PROMPTS[agent_type].format(scale=_SCALE, country=country, category=category, articles_block=block)

    try:
        response = _client.models.generate_content(model=GEMMA_MODEL, contents=prompt)
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw.strip())
        # key may be "score", "impact_score", "ripple_score", or "resonance_score"
        score = float(next(iter(data.values())))
        print(f"[{agent_type}] {item_id} → {score}")
        return score
    except Exception as exc:
        print(f"[{agent_type}] {item_id} failed: {exc}")
        return 0.0
