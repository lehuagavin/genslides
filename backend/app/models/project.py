"""Project domain models."""

from dataclasses import dataclass, field
from datetime import datetime

from .slide import Slide
from .style import Style


@dataclass
class CostInfo:
    """Cost information for a project."""

    total_images: int = 0
    style_generations: int = 0
    slide_generations: int = 0
    estimated_cost: float = 0.0
    currency: str = "USD"


@dataclass
class Project:
    """Represents a slide presentation project."""

    slug: str
    title: str = "Untitled"
    style: Style | None = None
    slides: list[Slide] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    cost: CostInfo = field(default_factory=CostInfo)

    def get_slide(self, sid: str) -> Slide | None:
        """Get a slide by its ID."""
        for slide in self.slides:
            if slide.sid == sid:
                return slide
        return None

    def get_slide_index(self, sid: str) -> int:
        """Get the index of a slide by its ID. Returns -1 if not found."""
        for i, slide in enumerate(self.slides):
            if slide.sid == sid:
                return i
        return -1
