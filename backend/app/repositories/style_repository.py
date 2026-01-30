"""Style repository for managing style images."""

import uuid
from pathlib import Path

from app.utils import ensure_directory, file_exists, list_files, read_bytes, write_bytes


class StyleRepository:
    """Repository for style image files."""

    def __init__(self, base_path: str = "./slides"):
        self.base_path = Path(base_path)

    def _get_style_dir(self, slug: str) -> Path:
        """Get the style directory for a project."""
        return self.base_path / slug / "style"

    def _get_candidates_dir(self, slug: str) -> Path:
        """Get the candidates directory for a project."""
        return self._get_style_dir(slug) / "candidates"

    def _get_style_image_path(self, slug: str) -> Path:
        """Get the path to the main style image."""
        return self._get_style_dir(slug) / "style.jpg"

    async def save_style_image(self, slug: str, image_data: bytes) -> str:
        """Save the main style image and return the relative path."""
        path = self._get_style_image_path(slug)
        await write_bytes(path, image_data)
        return "style/style.jpg"

    async def get_style_image(self, slug: str) -> bytes | None:
        """Get the main style image data."""
        path = self._get_style_image_path(slug)
        if not await file_exists(path):
            return None
        return await read_bytes(path)

    async def style_exists(self, slug: str) -> bool:
        """Check if a style image exists."""
        return await file_exists(self._get_style_image_path(slug))

    async def save_candidate(self, slug: str, image_data: bytes) -> str:
        """Save a candidate style image and return its ID."""
        candidates_dir = self._get_candidates_dir(slug)
        await ensure_directory(candidates_dir)

        candidate_id = f"candidate-{uuid.uuid4().hex[:8]}"
        path = candidates_dir / f"{candidate_id}.jpg"
        await write_bytes(path, image_data)
        return candidate_id

    async def get_candidate(self, slug: str, candidate_id: str) -> bytes | None:
        """Get a candidate image by ID."""
        path = self._get_candidates_dir(slug) / f"{candidate_id}.jpg"
        if not await file_exists(path):
            return None
        return await read_bytes(path)

    async def promote_candidate(self, slug: str, candidate_id: str) -> str | None:
        """Promote a candidate to the main style image."""
        candidate_data = await self.get_candidate(slug, candidate_id)
        if candidate_data is None:
            return None
        return await self.save_style_image(slug, candidate_data)

    async def clear_candidates(self, slug: str) -> None:
        """Clear all candidate images."""
        candidates_dir = self._get_candidates_dir(slug)
        files = await list_files(candidates_dir, "*.jpg")
        for file in files:
            file.unlink()

    def get_style_url(self, slug: str) -> str:
        """Get the URL for the style image."""
        return f"/static/slides/{slug}/style/style.jpg"

    def get_candidate_url(self, slug: str, candidate_id: str) -> str:
        """Get the URL for a candidate image."""
        return f"/static/slides/{slug}/style/candidates/{candidate_id}.jpg"
