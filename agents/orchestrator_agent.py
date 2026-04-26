"""
Orchestrator — drives the full pipeline for each (country, category) pair:

  on_interval
    └─► CurrentsRequest  →  currents_agent
          └─► CurrentsResponse
                └─► TrafilaturaRequest  →  trafilatura_agent
                      └─► TrafilaturaResponse
                            └─► SummaryRequest  →  gemma_summary_agent
                                  └─► SummaryResponse
                                        ├─► write articles + summary → backend
                                        └─► ScoreRequest × 3  →  scoring agents
                                              └─► ScoreResponse × 3
                                                    └─► patch scores → backend
"""
import datetime
import json
import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env")

import requests
from uagents import Agent, Context

from agents.shared.models import (
    CurrentsRequest, CurrentsResponse,
    TrafilaturaRequest, TrafilaturaResponse,
    SummaryRequest, SummaryResponse,
    ScoreRequest, ScoreResponse,
)

BACKEND_URL              = os.getenv("BACKEND_URL", "")
INTERNAL_WEBHOOK_SECRET  = os.getenv("INTERNAL_WEBHOOK_SECRET", "")

CURRENTS_AGENT_ADDRESS    = os.getenv("CURRENTS_AGENT_ADDRESS", "")
TRAFILATURA_AGENT_ADDRESS = os.getenv("TRAFILATURA_AGENT_ADDRESS", "")
GEMMA_SUMMARY_ADDRESS     = os.getenv("GEMMA_SUMMARY_ADDRESS", "")
SCORING_IMPACT_ADDRESS    = os.getenv("SCORING_IMPACT_ADDRESS", "")
SCORING_RIPPLE_ADDRESS    = os.getenv("SCORING_RIPPLE_ADDRESS", "")
SCORING_RESONANCE_ADDRESS = os.getenv("SCORING_RESONANCE_ADDRESS", "")

COUNTRIES = {
    "United States":                "US",
    "Brazil":                       "BR",
    "Nigeria":                      "NG",
    "India":                        "IN",
    "China":                        "CN",
    "Germany":                      "DE",
    "United Kingdom":               "GB",
    "Turkey":                       "TR",
    "Mexico":                       "MX",
    "Australia":                    "AU",
    "Kenya":                        "KE",
    "Ethiopia":                     "ET",
    "South Africa":                 "ZA",
    "Egypt":                        "EG",
    "Ghana":                        "GH",
    "Democratic Republic of Congo": "CD",
    "France":                       "FR",
    "Poland":                       "PL",
    "Spain":                        "ES",
    "Ukraine":                      "UA",
}

CATEGORIES = {
    "Scientific Breakthroughs":  {"currents": "science",     "keywords": ""},
    "Environmental Restoration": {"currents": "environment", "keywords": ""},
    "Social Progress":           {"currents": "world",       "keywords": "social progress equality"},
    "Public Health Crises":      {"currents": "medical",     "keywords": ""},
    "Armed Conflict & Violence": {"currents": "world",       "keywords": "armed conflict war violence"},
    "Human Rights Violations":   {"currents": "world",       "keywords": "human rights violations abuse"},
}

INTERVAL_SECONDS = 3600

_port = int(os.getenv("ORCHESTRATOR_PORT", "8003"))
agent = Agent(
    name="vigil_orchestrator",
    seed=os.getenv("ORCHESTRATOR_SEED", "vigil-orchestrator-seed"),
    port=_port,
    endpoint=[f"http://127.0.0.1:{_port}/submit"],
)


# ── State helpers ──────────────────────────────────────────────────────────────

def _save(ctx: Context, item_id: str, data: dict):
    ctx.storage.set(f"state_{item_id}", json.dumps(data))

def _load(ctx: Context, item_id: str) -> dict:
    raw = ctx.storage.get(f"state_{item_id}")
    return json.loads(raw) if raw else {}

def _clear(ctx: Context, item_id: str):
    ctx.storage.remove(f"state_{item_id}")


# ── Backend helpers ────────────────────────────────────────────────────────────

def _write_articles(country: str, category: str, articles: list, summary: str):
    if not BACKEND_URL:
        return
    links = [a["url"] for a in articles if a.get("url")]
    try:
        resp = requests.post(
            f"{BACKEND_URL}/internal/country-news",
            headers={"Content-Type": "application/json", "X-Webhook-Secret": INTERNAL_WEBHOOK_SECRET},
            json={"country": country, "category": category, "links": links,
                  "articles": articles, "summary": summary,
                  "updated_at": datetime.datetime.utcnow().isoformat() + "Z"},
            timeout=10,
        )
        print(f"[backend] wrote {country}/{category} → {resp.status_code}")
    except Exception as exc:
        print(f"[backend] write failed {country}/{category}: {exc}")


def _patch_scores(country: str, category: str, impact: float, ripple: float, resonance: float):
    if not BACKEND_URL:
        return
    final = round((impact + ripple + resonance) / 3, 2)
    try:
        resp = requests.patch(
            f"{BACKEND_URL}/internal/country-news/scores",
            headers={"Content-Type": "application/json", "X-Webhook-Secret": INTERNAL_WEBHOOK_SECRET},
            json={"country": country, "category": category,
                  "score_impact": round(impact, 2), "score_ripple": round(ripple, 2),
                  "score_resonance": round(resonance, 2), "final_score": final},
            timeout=10,
        )
        print(f"[backend] scores {country}/{category} final={final} → {resp.status_code}")
    except Exception as exc:
        print(f"[backend] patch scores failed {country}/{category}: {exc}")


# ── Stage 1: kick off cycle ────────────────────────────────────────────────────

@agent.on_interval(period=INTERVAL_SECONDS)
async def start_cycle(ctx: Context):
    if not CURRENTS_AGENT_ADDRESS:
        ctx.logger.error("CURRENTS_AGENT_ADDRESS not set")
        return

    cycle_id = datetime.datetime.utcnow().strftime("%Y%m%d-%H%M")
    ctx.logger.info(f"[{cycle_id}] Starting — 60 pairs")

    for country_name, country_code in COUNTRIES.items():
        for category_label, cat_cfg in CATEGORIES.items():
            item_id = f"{country_name}_{category_label}_{cycle_id}"
            _save(ctx, item_id, {
                "country": country_name,
                "category": category_label,
                "cycle_id": cycle_id,
                "stage": "currents",
            })
            await ctx.send(CURRENTS_AGENT_ADDRESS, CurrentsRequest(
                item_id=item_id,
                country_name=country_name,
                country_code=country_code,
                category_label=category_label,
                category_currents=cat_cfg["currents"],
                category_keywords=cat_cfg["keywords"],
                cycle_id=cycle_id,
            ))

    ctx.logger.info(f"[{cycle_id}] Sent 60 CurrentsRequests")


# ── Stage 2: got articles from Currents → send to Trafilatura ─────────────────

@agent.on_message(model=CurrentsResponse)
async def on_currents(ctx: Context, sender: str, msg: CurrentsResponse):
    state = _load(ctx, msg.item_id)
    if not state:
        return

    ctx.logger.info(f"[currents→trafilatura] {msg.item_id} — {len(msg.articles)} articles")
    state["stage"] = "trafilatura"
    _save(ctx, msg.item_id, state)

    await ctx.send(TRAFILATURA_AGENT_ADDRESS, TrafilaturaRequest(
        item_id=msg.item_id,
        articles=msg.articles,
        cycle_id=msg.cycle_id,
    ))


# ── Stage 3: got content → send to Gemma summary ──────────────────────────────

@agent.on_message(model=TrafilaturaResponse)
async def on_trafilatura(ctx: Context, sender: str, msg: TrafilaturaResponse):
    state = _load(ctx, msg.item_id)
    if not state:
        return

    ctx.logger.info(f"[trafilatura→gemma] {msg.item_id}")
    state["stage"]    = "summary"
    state["articles"] = msg.articles
    _save(ctx, msg.item_id, state)

    await ctx.send(GEMMA_SUMMARY_ADDRESS, SummaryRequest(
        item_id=msg.item_id,
        country=state["country"],
        category=state["category"],
        articles=msg.articles,
        cycle_id=msg.cycle_id,
    ))


# ── Stage 4: got summary → write to backend + fan out to scoring agents ────────

@agent.on_message(model=SummaryResponse)
async def on_summary(ctx: Context, sender: str, msg: SummaryResponse):
    state = _load(ctx, msg.item_id)
    if not state:
        return

    country  = state["country"]
    category = state["category"]
    articles = state.get("articles", [])

    ctx.logger.info(f"[summary→scoring] {msg.item_id}")

    # Write articles + summary to backend now
    _write_articles(country, category, articles, msg.summary)

    scoring_ok = all([SCORING_IMPACT_ADDRESS, SCORING_RIPPLE_ADDRESS, SCORING_RESONANCE_ADDRESS])
    if not scoring_ok:
        ctx.logger.warning("Scoring agent addresses not set — skipping scoring")
        _clear(ctx, msg.item_id)
        return

    # Advance state to scoring stage
    state["stage"]   = "scoring"
    state["summary"] = msg.summary
    state["scores"]  = {}
    _save(ctx, msg.item_id, state)

    # Cap content per article before sending to keep message size reasonable
    msg_articles = [
        {"title": a["title"], "url": a["url"], "content": a.get("content", "")[:2000]}
        for a in articles
    ]
    req = ScoreRequest(
        item_id=msg.item_id,
        country=country,
        category=category,
        articles=msg_articles,
        cycle_id=msg.cycle_id,
    )
    await ctx.send(SCORING_IMPACT_ADDRESS,    req)
    await ctx.send(SCORING_RIPPLE_ADDRESS,    req)
    await ctx.send(SCORING_RESONANCE_ADDRESS, req)


# ── Stage 5: collect scores → patch backend when all 3 arrive ─────────────────

@agent.on_message(model=ScoreResponse)
async def on_score(ctx: Context, sender: str, msg: ScoreResponse):
    state = _load(ctx, msg.item_id)
    if not state:
        return

    state["scores"][msg.agent_type] = msg.score
    ctx.logger.info(f"[score] {msg.item_id} {msg.agent_type}={msg.score} (have {list(state['scores'].keys())})")

    if {"impact", "ripple", "resonance"} <= state["scores"].keys():
        s = state["scores"]
        _patch_scores(state["country"], state["category"], s["impact"], s["ripple"], s["resonance"])
        _clear(ctx, msg.item_id)
    else:
        _save(ctx, msg.item_id, state)


if __name__ == "__main__":
    agent.run()
