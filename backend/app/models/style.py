"""Style domain models."""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Style:
    """Represents the visual style of a presentation."""

    prompt: str
    image: str  # relative path to style image
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class StyleCandidate:
    """Represents a candidate style image during style selection."""

    id: str
    path: str  # relative path to candidate image
