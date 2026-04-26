import datetime
import json
import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env")

from google import genai
import requests
import trafilatura
from uagents import Agent, Context

from agents.shared.models import ScoreRequest, ScoreResponse

BACKEND_URL = os.getenv("BACKEND_URL", "")
INTERNAL_WEBHOOK_SECRET = os.getenv("INTERNAL_WEBHOOK_SECRET", "")
CURRENTS_API_KEY = os.getenv("CURRENTS_API_KEY", "")
CURRENTS_BASE_URL = "https://api.currentsapi.services/v2/search"
GEMMA_API_KEY = os.getenv("GEMMA_API_KEY", "")
GEMMA_MODEL = "gemma-4-31b-it"

# Addresses of the 3 scoring agents — set these after starting each agent
# (each agent prints its address on startup)
SCORING_IMPACT_ADDRESS    = os.getenv("SCORING_IMPACT_ADDRESS", "")
SCORING_RIPPLE_ADDRESS    = os.getenv("SCORING_RIPPLE_ADDRESS", "")
SCORING_RESONANCE_ADDRESS = os.getenv("SCORING_RESONANCE_ADDRESS", "")

_client = genai.Client(api_key=GEMMA_API_KEY) if GEMMA_API_KEY else None

COUNTRIES = {
    "United States": "US",
    "Brazil":        "BR",
    "Nigeria":       "NG",
    "India":         "IN",
    "China":         "CN",
    "Germany":       "DE",
    "United Kingdom":"GB",
    "Turkey":        "TR",
    "Mexico":        "MX",
    "Australia":     "AU",
}

CATEGORIES = {
    "Scientific Breakthroughs":  {"currents": "science",     "keywords": None},
    "Environmental Restoration": {"currents": "environment", "keywords": None},
    "Social Progress":           {"currents": "world",       "keywords": "social progress equality"},
    "Public Health Crises":      {"currents": "medical",     "keywords": None},
    "Armed Conflict & Violence": {"currents": "world",       "keywords": "armed conflict war violence"},
    "Human Rights Violations":   {"currents": "world",       "keywords": "human rights violations abuse"},
}

MAX_ARTICLES_PER_PAIR = 8
INTERVAL_SECONDS = 3600

_port = int(os.getenv("AGENT_PORT", "8003"))
agent = Agent(
    name="vigil_data_agent",
    seed=os.getenv("DATA_AGENT_SEED", "vigil-data-agent-seed"),
    port=_port,
    endpoint=[f"http://127.0.0.1:{_port}/submit"],
)


# ── Currents API ───────────────────────────────────────────────────────────────

def fetch_currents(country_name: str, country_code: str, category_label: str) -> list[dict]:
    if not CURRENTS_API_KEY:
        return []

    cat_cfg = CATEGORIES[category_label]
    params = {
        "apiKey": CURRENTS_API_KEY,
        "language": "en",
        "country": country_code,
        "page_size": MAX_ARTICLES_PER_PAIR,
    }

    # Always use keywords — free tier doesn't support country + category together
    keywords = cat_cfg["keywords"] or cat_cfg["currents"]
    params["keywords"] = f"{country_name} {keywords}"
    del params["country"]  # country filter causes 400 on free tier

    try:
        resp = requests.get(CURRENTS_BASE_URL, params=params, timeout=15)
        resp.raise_for_status()
        return resp.json().get("news", []) or []
    except Exception as exc:
        print(f"[Currents] {country_name}/{category_label} failed: {exc}")
        return []


# ── Trafilatura ────────────────────────────────────────────────────────────────

def fetch_content(url: str) -> Optional[str]:
    try:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return None
        text = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
        return text[:8000] if text else None
    except Exception:
        return None


# ── Gemma summary ──────────────────────────────────────────────────────────────

def summarize_with_gemma(country: str, category: str, articles: list[dict]) -> str:
    if not _client or not articles:
        return ""

    blocks = []
    for i, a in enumerate(articles, 1):
        title = a.get("title") or ""
        content = a.get("content") or ""
        if content:
            blocks.append(f"[Article {i}] {title}\n{content}")

    if not blocks:
        return ""

    combined = "\n\n---\n\n".join(blocks)
    prompt = (
        f"You are summarizing news coverage about {country} under the topic: {category}.\n\n"
        f"Below are {len(blocks)} news article(s). Read all of them and write a single coherent "
        f"summary (50-60 words) describing what is currently happening in {country} "
        f"related to {category}. Be factual, specific, and cite numbers where present.\n\n{combined}"
    )

    try:
        response = _client.models.generate_content(model=GEMMA_MODEL, contents=prompt)
        return response.text.strip()
    except Exception as exc:
        print(f"[Gemma] {country}/{category} failed: {exc}")
        return ""


# ── Backend write ──────────────────────────────────────────────────────────────

def write_articles(country: str, category: str, articles: list[dict], summary: str) -> None:
    if not BACKEND_URL:
        print(f"[Backend] BACKEND_URL not set — skipping {country}/{category}")
        return
    links = [a["url"] for a in articles if a.get("url")]
    try:
        resp = requests.post(
            f"{BACKEND_URL}/internal/country-news",
            headers={"Content-Type": "application/json", "X-Webhook-Secret": INTERNAL_WEBHOOK_SECRET},
            json={
                "country": country,
                "category": category,
                "links": links,
                "articles": articles,
                "summary": summary,
                "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
            },
            timeout=10,
        )
        print(f"[Backend] wrote articles {country}/{category} → {resp.status_code}")
    except Exception as exc:
        print(f"[Backend] write_articles failed for {country}/{category}: {exc}")


def patch_scores(country: str, category: str, impact: float, ripple: float, resonance: float) -> None:
    if not BACKEND_URL:
        return
    final = round((impact + ripple + resonance) / 3, 2)
    try:
        resp = requests.patch(
            f"{BACKEND_URL}/internal/country-news/scores",
            headers={"Content-Type": "application/json", "X-Webhook-Secret": INTERNAL_WEBHOOK_SECRET},
            json={
                "country": country,
                "category": category,
                "score_impact": round(impact, 2),
                "score_ripple": round(ripple, 2),
                "score_resonance": round(resonance, 2),
                "final_score": final,
            },
            timeout=10,
        )
        print(f"[Backend] patched scores {country}/{category} final={final} → {resp.status_code}")
    except Exception as exc:
        print(f"[Backend] patch_scores failed for {country}/{category}: {exc}")


# ── Score response handler ─────────────────────────────────────────────────────

@agent.on_message(model=ScoreResponse)
async def handle_score_response(ctx: Context, sender: str, msg: ScoreResponse):
    key = f"scores_{msg.item_id}"
    raw = ctx.storage.get(key)
    state = json.loads(raw) if raw else {}

    state[msg.agent_type] = msg.score
    ctx.logger.info(f"[scores] {msg.item_id} got {msg.agent_type}={msg.score} (have {list(state.keys())})")

    if {"impact", "ripple", "resonance"} <= state.keys():
        # All 3 arrived — patch backend and clear storage
        meta_raw = ctx.storage.get(f"meta_{msg.item_id}")
        if meta_raw:
            meta = json.loads(meta_raw)
            patch_scores(meta["country"], meta["category"], state["impact"], state["ripple"], state["resonance"])
            ctx.storage.remove(f"meta_{msg.item_id}")
        ctx.storage.remove(key)
    else:
        ctx.storage.set(key, json.dumps(state))


# ── Main interval ──────────────────────────────────────────────────────────────

@agent.on_interval(period=INTERVAL_SECONDS)
async def collect_news(ctx: Context):
    cycle_id = datetime.datetime.utcnow().strftime("%Y%m%d-%H%M")
    ctx.logger.info(f"[{cycle_id}] Starting — {len(COUNTRIES)} countries × {len(CATEGORIES)} categories")

    scoring_addresses = [SCORING_IMPACT_ADDRESS, SCORING_RIPPLE_ADDRESS, SCORING_RESONANCE_ADDRESS]
    scoring_enabled = all(scoring_addresses)
    if not scoring_enabled:
        ctx.logger.warning("One or more SCORING_*_ADDRESS env vars not set — scores will be skipped")

    for country_name, country_code in COUNTRIES.items():
        for category_label in CATEGORIES:
            item_id = f"{country_name}_{category_label}_{cycle_id}"
            ctx.logger.info(f"[{cycle_id}] {country_name} / {category_label}")

            # 1. Fetch article list from Currents
            raw_articles = fetch_currents(country_name, country_code, category_label)

            # 2. Fetch full content via trafilatura
            enriched = []
            for article in raw_articles[:MAX_ARTICLES_PER_PAIR]:
                url = article.get("url")
                if not url:
                    continue
                content = fetch_content(url)
                enriched.append({
                    "title": article.get("title", ""),
                    "url": url,
                    "content": content or article.get("description") or "",
                })

            # 3. Summarize with Gemma
            summary = summarize_with_gemma(country_name, category_label, enriched)

            # 4. Write articles + summary to backend immediately (scores come later)
            write_articles(country_name, category_label, enriched, summary)

            # 5. Send score requests to all 3 scoring agents
            if scoring_enabled:
                # Cap content in message to avoid oversized payloads
                msg_articles = [
                    {"title": a["title"], "url": a["url"], "content": a["content"][:2000]}
                    for a in enriched
                ]
                req = ScoreRequest(
                    item_id=item_id,
                    country=country_name,
                    category=category_label,
                    articles=msg_articles,
                    cycle_id=cycle_id,
                )
                # Store metadata so the response handler knows what to patch
                ctx.storage.set(f"meta_{item_id}", json.dumps({
                    "country": country_name,
                    "category": category_label,
                }))
                await ctx.send(SCORING_IMPACT_ADDRESS, req)
                await ctx.send(SCORING_RIPPLE_ADDRESS, req)
                await ctx.send(SCORING_RESONANCE_ADDRESS, req)

    ctx.logger.info(f"[{cycle_id}] Done dispatching — awaiting score responses")


if __name__ == "__main__":
    agent.run()
