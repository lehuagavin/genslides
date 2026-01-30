"""Data access repositories."""

from .image_repository import ImageRepository
from .slides_repository import SlidesRepository
from .style_repository import StyleRepository

__all__ = [
    "ImageRepository",
    "SlidesRepository",
    "StyleRepository",
]
