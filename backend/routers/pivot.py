from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

try:
    from backend.services.currents_service import CurrentsService
except ModuleNotFoundError:
    from services.currents_service import CurrentsService

router = APIRouter(prefix="/api/pivot", tags=["pivot"])
currents = CurrentsService()


def _freshness_weight(published: str | None) -> float:
    if not published:
        return 0.3
    try:
        dt = datetime.strptime(published, "%Y-%m-%d %H:%M:%S %z")
    except Exception:
        return 0.3
    age_days = (datetime.now(timezone.utc) - dt.astimezone(timezone.utc)).days
    if age_days <= 2:
        return 1.0
    if age_days <= 7:
        return 0.7
    if age_days <= 14:
        return 0.4
    return 0.2


def _category_score(articles: list[dict]) -> tuple[float, dict]:
    count = len(articles)
    if count == 0:
        return 0.0, {"article_count": 0, "source_count": 0, "freshness_avg": 0.0}
    source_count = len({a.get("source_name") for a in articles if a.get("source_name")})
    freshness_avg = sum(_freshness_weight(a.get("published")) for a in articles) / count
    volume_component = min(count / 50.0, 1.0) * 60.0
    freshness_component = freshness_avg * 25.0
    source_component = min(source_count / 10.0, 1.0) * 15.0
    score = round(volume_component + freshness_component + source_component, 2)
    return score, {
        "article_count": count,
        "source_count": source_count,
        "freshness_avg": round(freshness_avg, 3),
    }


@router.get("/status")
async def pivot_status():
    return {
        "configured": currents.configured,
        "default_countries": currents.default_countries(),
        "default_categories": currents.default_categories(),
    }


@router.get("/preview")
async def preview_currents_news(
    countries: str | None = Query(default=None, description="CSV 2-letter country codes, e.g. AO,SD"),
    categories: str | None = Query(default=None, description="CSV categories, e.g. health,technology"),
    lookback_days: int | None = Query(default=None, ge=1, le=30),
    page_size: int | None = Query(default=None, ge=1, le=100),
):
    if not currents.configured:
        raise HTTPException(status_code=400, detail="CURRENTS_API_KEY is missing")

    country_list = [c.strip().upper() for c in countries.split(",")] if countries else currents.default_countries()
    category_list = [c.strip().lower() for c in categories.split(",")] if categories else currents.default_categories()

    results = []
    errors = []
    for country in country_list[:2]:
        for category in category_list[:2]:
            try:
                item = await currents.search_country_category(
                    country=country,
                    category=category,
                    lookback_days=lookback_days,
                    page_size=page_size,
                )
                results.append(item)
            except Exception as exc:
                errors.append({"country": country, "category": category, "error": str(exc)})

    summaries_by_country = {}
    for country in country_list[:2]:
        country_results = [item for item in results if item["country"] == country]
        scored = []
        total_articles = 0
        for item in country_results:
            score, _debug = _category_score(item.get("articles", []))
            scored.append({"category": item["category"], "score": score, "article_count": item.get("count", 0)})
            total_articles += item.get("count", 0)
        overall = 0.0
        if total_articles > 0:
            overall = round(sum(s["score"] * s["article_count"] for s in scored) / total_articles, 2)
        summaries_by_country[country] = {
            "overall_score": overall,
            "article_count_total": total_articles,
            "category_scores": scored,
        }

    return {
        "countries": country_list[:2],
        "categories": category_list[:2],
        "combination_count": len(country_list[:2]) * len(category_list[:2]),
        "result_count": len(results),
        "error_count": len(errors),
        "summaries_by_country": summaries_by_country,
        "results": results,
        "errors": errors,
    }


@router.get("/country/{country_code}/news")
async def country_news(
    country_code: str,
    category: str = Query(..., description="Currents category"),
    lookback_days: int | None = Query(default=None, ge=1, le=30),
    page_size: int | None = Query(default=None, ge=1, le=100),
):
    if not currents.configured:
        raise HTTPException(status_code=400, detail="CURRENTS_API_KEY is missing")
    try:
        payload = await currents.search_country_category(
            country=country_code.upper(),
            category=category.lower(),
            lookback_days=lookback_days,
            page_size=page_size,
        )
        print(
            "[Pivot][country_news] "
            f"country={country_code.upper()} category={category.lower()} "
            f"lookback_days={lookback_days if lookback_days is not None else 'default'} "
            f"page_size={page_size if page_size is not None else 'default'} "
            f"count={payload.get('count', 0)} fallback={payload.get('fallback_mode', False)}"
        )
        print(f"[Pivot][country_news][payload_sample] {str(payload)[:1200]}")
        return payload
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Currents request failed: {exc}") from exc


@router.get("/country/{country_code}/summary")
async def country_summary(
    country_code: str,
    categories: str | None = Query(default=None, description="CSV categories, e.g. health,politics_government"),
    lookback_days: int | None = Query(default=None, ge=1, le=30),
    page_size: int | None = Query(default=None, ge=1, le=100),
):
    if not currents.configured:
        raise HTTPException(status_code=400, detail="CURRENTS_API_KEY is missing")

    category_list = [c.strip().lower() for c in categories.split(",")] if categories else currents.default_categories()
    category_list = category_list[:2]
    computed = []
    errors = []
    for category in category_list:
        try:
            result = await currents.search_country_category(
                country=country_code.upper(),
                category=category,
                lookback_days=lookback_days,
                page_size=page_size,
            )
            score, debug = _category_score(result.get("articles", []))
            computed.append(
                {
                    "category": category,
                    "score": score,
                    "article_count": result.get("count", 0),
                    "source_count": debug["source_count"],
                    "freshness_avg": debug["freshness_avg"],
                    "fallback_mode": result.get("fallback_mode", False),
                }
            )
        except Exception as exc:
            errors.append({"category": category, "error": str(exc)})

    total_articles = sum(item["article_count"] for item in computed)
    if total_articles > 0:
        weighted = sum(item["score"] * item["article_count"] for item in computed) / total_articles
        overall_score = round(weighted, 2)
    else:
        overall_score = 0.0

    response_payload = {
        "country_code": country_code.upper(),
        "lookback_days": lookback_days if lookback_days is not None else 14,
        "overall_score": overall_score,
        "article_count_total": total_articles,
        "category_scores": computed,
        "error_count": len(errors),
        "errors": errors,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    print(
        "[Pivot][country_summary] "
        f"country={country_code.upper()} categories={category_list} "
        f"lookback_days={lookback_days if lookback_days is not None else 'default'} "
        f"page_size={page_size if page_size is not None else 'default'} "
        f"overall={overall_score} total_articles={total_articles} errors={len(errors)}"
    )
    print(f"[Pivot][country_summary][payload] {str(response_payload)[:1200]}")
    return response_payload
