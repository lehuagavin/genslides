"""Image repository for managing slide images."""

from pathlib import Path

from app.utils import delete_file, ensure_directory, file_exists, list_files, read_bytes, write_bytes


class ImageRepository:
    """Repository for slide image files."""

    def __init__(self, base_path: str = "./slides"):
        self.base_path = Path(base_path)

    def _get_images_dir(self, slug: str, sid: str) -> Path:
        """Get the images directory for a slide."""
        return self.base_path / slug / "images" / sid

    def _get_image_path(self, slug: str, sid: str, hash: str) -> Path:
        """Get the path to an image file."""
        return self._get_images_dir(slug, sid) / f"{hash}.jpg"

    def _get_thumbnail_path(self, slug: str, sid: str, hash: str) -> Path:
        """Get the path to a thumbnail file."""
        return self._get_images_dir(slug, sid) / f"{hash}_thumb.jpg"

    async def save_image(self, slug: str, sid: str, hash: str, image_data: bytes) -> str:
        """Save an image and return the relative path."""
        images_dir = self._get_images_dir(slug, sid)
        await ensure_directory(images_dir)

        path = self._get_image_path(slug, sid, hash)
        await write_bytes(path, image_data)
        return f"images/{sid}/{hash}.jpg"

    async def save_thumbnail(self, slug: str, sid: str, hash: str, thumbnail_data: bytes) -> str:
        """Save a thumbnail and return the relative path."""
        images_dir = self._get_images_dir(slug, sid)
        await ensure_directory(images_dir)

        path = self._get_thumbnail_path(slug, sid, hash)
        await write_bytes(path, thumbnail_data)
        return f"images/{sid}/{hash}_thumb.jpg"

    async def get_image(self, slug: str, sid: str, hash: str) -> bytes | None:
        """Get an image by hash."""
        path = self._get_image_path(slug, sid, hash)
        if not await file_exists(path):
            return None
        return await read_bytes(path)

    async def image_exists(self, slug: str, sid: str, hash: str) -> bool:
        """Check if an image exists."""
        return await file_exists(self._get_image_path(slug, sid, hash))

    async def delete_image(self, slug: str, sid: str, hash: str) -> bool:
        """Delete an image and its thumbnail. Returns True if deleted."""
        image_path = self._get_image_path(slug, sid, hash)
        thumbnail_path = self._get_thumbnail_path(slug, sid, hash)

        image_deleted = await delete_file(image_path)
        await delete_file(thumbnail_path)  # Also delete thumbnail if exists

        return image_deleted

    async def list_images(self, slug: str, sid: str) -> list[str]:
        """List all image hashes for a slide."""
        images_dir = self._get_images_dir(slug, sid)
        files = await list_files(images_dir, "*.jpg")
        hashes = []
        for file in files:
            name = file.stem
            if not name.endswith("_thumb"):
                hashes.append(name)
        return hashes

    def get_image_url(self, slug: str, sid: str, hash: str) -> str:
        """Get the URL for an image."""
        return f"/static/slides/{slug}/images/{sid}/{hash}.jpg"

    def get_thumbnail_url(self, slug: str, sid: str, hash: str) -> str:
        """Get the URL for a thumbnail."""
        return f"/static/slides/{slug}/images/{sid}/{hash}_thumb.jpg"
