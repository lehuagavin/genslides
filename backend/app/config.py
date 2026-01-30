"""Application configuration using pydantic-settings."""

import json
from functools import cached_property, lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Gemini API
    gemini_api_key: str = ""

    # Storage
    slides_base_path: str = "./slides"

    # Server
    server_host: str = "0.0.0.0"
    server_port: int = 3003

    # CORS - raw string from env, parsed in cors_origins property
    cors_origins_raw: str = "http://localhost:5173"

    # Cost configuration (USD per image)
    cost_per_style_image: float = 0.02
    cost_per_slide_image: float = 0.02

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @cached_property
    def cors_origins(self) -> list[str]:
        """Parse cors_origins from raw string."""
        raw = self.cors_origins_raw
        if raw.startswith("["):
            origins: list[str] = json.loads(raw)
            return origins
        return [origin.strip() for origin in raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
