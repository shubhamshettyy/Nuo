import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

try:
    from backend.config import get_settings
except ModuleNotFoundError:
    from config import get_settings

logger = logging.getLogger("vigil.currents")

SUPPORTED_COUNTRY_FILTERS = {
    "US", "TW", "DE", "GB", "CN", "IN", "ES", "IT", "PL", "AU", "MY", "SG", "CA", "KR", "DK", "FR", "BE",
    "JP", "AT", "PT", "PH", "HK", "AR", "VE", "BR", "FI", "ID", "VN", "MX", "GR", "NL", "NO", "NZ", "RU",
    "SA", "CH", "TH", "AE", "IE", "IR", "IQ", "RO", "AF", "ZW", "MM", "SE", "PE", "PA", "EG", "TR", "IL",
    "CZ", "BD", "NG", "KE", "CL", "UY", "EC", "RS", "HU", "SI", "GH", "BO", "PK", "CO", "NK", "PY", "PS",
    "EE", "LB", "QA", "KW", "KH", "NP", "LU", "EU", "ASIA", "INT", "BA",
}

COUNTRY_CODE_TO_NAME = {
    "NGA": "Nigeria",
    "EGY": "Egypt",
    "AO": "Angola",
    "SD": "Sudan",
    "NG": "Nigeria",
    "EG": "Egypt",
}

ISO3_TO_ISO2 = {
    "NGA": "NG",
    "EGY": "EG",
    "AGO": "AO",
    "SDN": "SD",
}


def _compact_json(data: Any, limit: int = 3000) -> str:
    text = json.dumps(data, default=str, ensure_ascii=True)
    if len(text) <= limit:
        return text
    return text[:limit] + "...<truncated>"


class CurrentsService:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def configured(self) -> bool:
        return bool(self.settings.currents_api_key)

    @staticmethod
    def _split_csv(raw: str) -> list[str]:
        return [item.strip() for item in raw.split(",") if item.strip()]

    def default_countries(self) -> list[str]:
        return [c.upper() for c in self._split_csv(self.settings.pivot_countries)]

    def default_categories(self) -> list[str]:
        return [c.lower() for c in self._split_csv(self.settings.pivot_categories)]

    @staticmethod
    def _normalize_country_code(input_code: str) -> str:
        code = input_code.upper().strip()
        if code in ISO3_TO_ISO2:
            return ISO3_TO_ISO2[code]
        return code

    def _search_url(self) -> str:
        version = (self.settings.currents_api_version or "v2").lower().strip()
        if version not in {"v1", "v2"}:
            version = "v2"
        return f"{self.settings.currents_base_url}/{version}/search"

    async def search_country_category(
        self,
        *,
        country: str,
        category: str,
        lookback_days: int | None = None,
        page_size: int | None = None,
        language: str = "en",
    ) -> dict[str, Any]:
        if not self.configured:
            raise RuntimeError("CURRENTS_API_KEY is not configured")

        days = lookback_days if lookback_days is not None else self.settings.pivot_lookback_days
        limit = page_size if page_size is not None else self.settings.pivot_page_size
        start_date = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
        end_date = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        url = self._search_url()
        requested_country_raw = country.upper()
        requested_country = self._normalize_country_code(requested_country_raw)
        params = {
            "category": category,
            "language": language,
            "start_date": start_date,
            "end_date": end_date,
            "page_number": 1,
            "page_size": limit,
            "apiKey": self.settings.currents_api_key,
        }

        fallback_mode = False
        if requested_country in SUPPORTED_COUNTRY_FILTERS:
            params["country"] = requested_country
        else:
            fallback_mode = True
            country_name = COUNTRY_CODE_TO_NAME.get(requested_country_raw) or COUNTRY_CODE_TO_NAME.get(requested_country) or requested_country
            params["keywords"] = f"{country_name} {category}"
            print(
                f"[Currents][FALLBACK] country={requested_country_raw} normalized={requested_country} not supported by country filter; "
                f"using keyword query='{params['keywords']}'"
            )
        headers = {"Authorization": self.settings.currents_api_key}

        logger.info("Currents request: %s", _compact_json({"url": url, "params": params}))
        print(f"[Currents][REQUEST] { _compact_json({'url': url, 'params': params}) }")
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(url, params=params, headers=headers)
            raw_text = response.text
            logger.info("Currents response status=%s body=%s", response.status_code, raw_text[:3500])
            print(f"[Currents][RESPONSE] status={response.status_code} body={raw_text[:3500]}")
            if response.status_code >= 400:
                raise httpx.HTTPStatusError(
                    f"Currents error status={response.status_code} body={raw_text[:800]}",
                    request=response.request,
                    response=response,
                )
            payload = response.json()

        normalized = []
        for item in payload.get("news", []):
            normalized.append(
                {
                    "id": item.get("id"),
                    "country": country.upper(),
                    "category_requested": category,
                    "title": item.get("title"),
                    "description": item.get("description"),
                    "url": item.get("url"),
                    "author": item.get("author"),
                    "image": item.get("image"),
                    "language": item.get("language"),
                    "category": item.get("category", []),
                    "published": item.get("published"),
                    "source_name": self._extract_source(item.get("url")),
                }
            )

        logger.info(
            "Currents normalized result country=%s category=%s count=%s sample=%s",
            requested_country_raw,
            category,
            len(normalized),
            _compact_json(normalized[0] if normalized else {"sample": "no articles"}),
        )
        print(
            f"[Currents][NORMALIZED] country={requested_country_raw} normalized={requested_country} category={category} "
            f"count={len(normalized)} sample={_compact_json(normalized[0] if normalized else {'sample': 'no articles'})}"
        )
        return {
            "country": requested_country_raw,
            "country_normalized": requested_country,
            "category": category,
            "lookback_days": days,
            "count": len(normalized),
            "articles": normalized,
            "raw_status": payload.get("status"),
            "raw_page": payload.get("page"),
            "fallback_mode": fallback_mode,
            "requested_country_supported": requested_country in SUPPORTED_COUNTRY_FILTERS,
        }

    @staticmethod
    def _extract_source(url: str | None) -> str | None:
        if not url:
            return None
        try:
            from urllib.parse import urlparse

            parsed = urlparse(url)
            return parsed.netloc or None
        except Exception:
            return None
