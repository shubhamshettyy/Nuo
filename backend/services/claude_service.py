import json

import httpx

try:
    from backend.config import get_settings
except ModuleNotFoundError:
    from config import get_settings


class ClaudeService:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def configured(self) -> bool:
        return bool(self.settings.anthropic_api_key)

    async def generate_country_brief(self, country_doc: dict) -> str:
        country_name = country_doc.get("name") or country_doc.get("_id", "Unknown country")
        inline_stats = {
            "invisible_index": country_doc.get("invisible_index", 0),
            "suffering_score": country_doc.get("suffering_score", 0),
            "attention_score": country_doc.get("attention_score", 0),
            "displaced_persons": country_doc.get("displaced_persons", 0),
            "conflict_events": country_doc.get("conflict_events", 0),
            "article_count_filtered": country_doc.get("article_count_filtered", 0),
            "last_updated": country_doc.get("last_updated"),
        }

        if not self.configured:
            return (
                f"{country_name} currently has an Invisible Index of {inline_stats['invisible_index']:.1f}. "
                "This local fallback brief is active because ANTHROPIC_API_KEY is not configured. "
                "Set the key to get a richer three-sentence narrative."
            )

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.settings.anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 220,
                    "system": (
                        "You are a humanitarian intelligence briefing system. "
                        "Write plain English only, no bullet points, exactly three sentences."
                    ),
                    "messages": [
                        {
                            "role": "user",
                            "content": (
                                f"Generate a crisis brief for {country_name}. "
                                f"Data: {json.dumps(inline_stats, default=str)}. "
                                "Sentence 1: what is happening. "
                                "Sentence 2: why media attention is lagging. "
                                "Sentence 3: what intervention would help."
                            ),
                        }
                    ],
                },
            )
            response.raise_for_status()
            body = response.json()
            return body["content"][0]["text"].strip()
