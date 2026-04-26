from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    anthropic_api_key: str = ""

    mongo_uri: str = ""
    mongo_database: str = "vigil"

    internal_webhook_secret: str = ""

    frontend_origin: str = "*"

    currents_api_key: str = ""
    currents_base_url: str = "https://api.currentsapi.services"
    currents_api_version: str = "v2"
    pivot_countries: str = "AO,SD"
    pivot_categories: str = "health,technology"
    pivot_lookback_days: int = 14
    pivot_page_size: int = 20


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
