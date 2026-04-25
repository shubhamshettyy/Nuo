from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    anthropic_api_key: str = ""

    mongo_data_api_url: str = ""
    mongo_data_api_key: str = ""
    mongo_database: str = "vigil"
    mongo_datasource: str = "Cluster0"

    internal_webhook_secret: str = ""

    frontend_origin: str = "*"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
