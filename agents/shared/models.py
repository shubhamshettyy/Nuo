from typing import Dict, List

from uagents import Model


class ScoreRequest(Model):
    item_id: str
    country: str
    category: str
    articles: List[Dict]  # [{title, url, content}] — content capped before sending
    cycle_id: str


class ScoreResponse(Model):
    item_id: str
    agent_type: str   # "impact" | "ripple" | "resonance"
    score: float
    cycle_id: str


class VerifiedIndexUpdate(Model):
    countries: Dict[str, float]
    quarantined: List[str]
    cycle_id: str
