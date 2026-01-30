"""Cost calculation service."""

from app.config import Settings
from app.models import CostInfo


class CostService:
    """Service for calculating and tracking image generation costs."""

    def __init__(self, settings: Settings):
        self.cost_per_style = settings.cost_per_style_image
        self.cost_per_slide = settings.cost_per_slide_image

    def calculate_cost(self, cost_info: CostInfo) -> float:
        """Calculate total estimated cost from cost info."""
        style_cost = cost_info.style_generations * self.cost_per_style
        slides_cost = cost_info.slide_generations * self.cost_per_slide
        return style_cost + slides_cost

    def get_breakdown(self, cost_info: CostInfo) -> dict[str, float]:
        """Get cost breakdown by type."""
        return {
            "style_cost": cost_info.style_generations * self.cost_per_style,
            "slides_cost": cost_info.slide_generations * self.cost_per_slide,
        }
