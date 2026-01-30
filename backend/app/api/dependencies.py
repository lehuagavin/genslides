"""FastAPI dependency injection."""

from functools import lru_cache

from app.config import get_settings
from app.repositories import ImageRepository, SlidesRepository, StyleRepository
from app.services import (
    CostService,
    GeminiService,
    ImageService,
    SlidesService,
    StyleService,
)


@lru_cache
def get_slides_repository() -> SlidesRepository:
    """Get slides repository instance."""
    settings = get_settings()
    return SlidesRepository(settings.slides_base_path)


@lru_cache
def get_style_repository() -> StyleRepository:
    """Get style repository instance."""
    settings = get_settings()
    return StyleRepository(settings.slides_base_path)


@lru_cache
def get_image_repository() -> ImageRepository:
    """Get image repository instance."""
    settings = get_settings()
    return ImageRepository(settings.slides_base_path)


@lru_cache
def get_gemini_service() -> GeminiService:
    """Get Gemini service instance."""
    settings = get_settings()
    return GeminiService(settings.gemini_api_key)


@lru_cache
def get_cost_service() -> CostService:
    """Get cost service instance."""
    settings = get_settings()
    return CostService(settings)


def get_slides_service() -> SlidesService:
    """Get slides service instance."""
    return SlidesService(get_slides_repository())


def get_style_service() -> StyleService:
    """Get style service instance."""
    return StyleService(
        slides_repository=get_slides_repository(),
        style_repository=get_style_repository(),
        gemini_service=get_gemini_service(),
    )


def get_image_service() -> ImageService:
    """Get image service instance."""
    return ImageService(
        slides_repository=get_slides_repository(),
        style_repository=get_style_repository(),
        image_repository=get_image_repository(),
        gemini_service=get_gemini_service(),
    )
