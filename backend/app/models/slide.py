"""Slide domain models."""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class SlideImage:
    """Represents an image generated for a slide."""

    hash: str  # blake3 hash of content
    path: str  # relative path to image file
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class Slide:
    """Represents a single slide in a presentation."""

    sid: str
    content: str
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    images: list[SlideImage] = field(default_factory=list)

    def get_current_image(self, content_hash: str) -> SlideImage | None:
        """Get the most recent image matching the current content hash."""
        for image in reversed(self.images):
            if image.hash == content_hash:
                return image
        return self.images[-1] if self.images else None
