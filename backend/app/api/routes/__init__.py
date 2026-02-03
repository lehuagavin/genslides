"""API routes."""

from .images import router as images_router
from .slides import router as slides_router
from .style import router as style_router
from .style import templates_router as style_templates_router
from .websocket import router as websocket_router

__all__ = [
    "images_router",
    "slides_router",
    "style_router",
    "style_templates_router",
    "websocket_router",
]
