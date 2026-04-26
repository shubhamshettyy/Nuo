from typing import Dict, List

from uagents import Model


# ── Currents ───────────────────────────────────────────────────────────────────

class CurrentsRequest(Model):
    item_id: str
    country_name: str
    country_code: str
    category_label: str
    category_currents: str   # e.g. "science"
    category_keywords: str   # e.g. "Nigeria armed conflict" — empty string if unused
    cycle_id: str


class CurrentsResponse(Model):
    item_id: str
    articles: List[Dict]     # [{title, url, description}]
    cycle_id: str


# ── Trafilatura ────────────────────────────────────────────────────────────────

class TrafilaturaRequest(Model):
    item_id: str
    articles: List[Dict]     # [{title, url, description}]
    cycle_id: str


class TrafilaturaResponse(Model):
    item_id: str
    articles: List[Dict]     # [{title, url, content}]
    cycle_id: str


# ── Gemma summary ──────────────────────────────────────────────────────────────

class SummaryRequest(Model):
    item_id: str
    country: str
    category: str
    articles: List[Dict]
    cycle_id: str


class SummaryResponse(Model):
    item_id: str
    summary: str
    cycle_id: str


# ── Scoring ────────────────────────────────────────────────────────────────────

class ScoreRequest(Model):
    item_id: str
    country: str
    category: str
    articles: List[Dict]
    cycle_id: str


class ScoreResponse(Model):
    item_id: str
    agent_type: str          # "impact" | "ripple" | "resonance"
    score: float
    cycle_id: str


# ── Legacy ─────────────────────────────────────────────────────────────────────

class VerifiedIndexUpdate(Model):
    countries: Dict[str, float]
    quarantined: List[str]
    cycle_id: str
