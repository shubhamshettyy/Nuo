from typing import Dict, List

from uagents import Model


class RawDataPayload(Model):
    countries: Dict[str, float]
    article_counts_raw: Dict[str, int]
    article_counts_filtered: Dict[str, int]
    suffering_scores: Dict[str, float]
    attention_scores: Dict[str, float]
    cycle_id: str


class VerifiedIndexUpdate(Model):
    countries: Dict[str, float]
    quarantined: List[str]
    cycle_id: str


class AlertPayload(Model):
    country_code: str
    previous_score: float
    new_score: float
    delta: float
    cycle_id: str
