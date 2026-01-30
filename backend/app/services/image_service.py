"""Image generation service."""

import io
import logging
from datetime import datetime

from PIL import Image

from app.exceptions import ImageNotFoundError, SlideNotFoundError, StyleNotSetError
from app.models import SlideImage
from app.repositories import ImageRepository, SlidesRepository, StyleRepository
from app.services.gemini_service import GeminiService
from app.utils import compute_content_hash

logger = logging.getLogger(__name__)


class ImageService:
    """Service for generating and managing slide images."""

    def __init__(
        self,
        slides_repository: SlidesRepository,
        style_repository: StyleRepository,
        image_repository: ImageRepository,
        gemini_service: GeminiService,
    ):
        self.slides_repository = slides_repository
        self.style_repository = style_repository
        self.image_repository = image_repository
        self.gemini_service = gemini_service

    async def get_images(self, slug: str, sid: str) -> list[SlideImage]:
        """Get all images for a slide."""
        project = await self.slides_repository.get_or_create_project(slug)
        slide = project.get_slide(sid)

        if slide is None:
            raise SlideNotFoundError(sid)

        return slide.images

    async def generate_image(self, slug: str, sid: str, force: bool = False) -> SlideImage:
        """Generate an image for a slide.

        Args:
            slug: Project slug
            sid: Slide ID
            force: Force regeneration even if matching image exists

        Returns:
            The generated SlideImage
        """
        # First, get project data for validation and content
        project = await self.slides_repository.get_or_create_project(slug)
        slide = project.get_slide(sid)

        if slide is None:
            raise SlideNotFoundError(sid)

        if project.style is None:
            raise StyleNotSetError()

        # Check if we already have a matching image
        content_hash = compute_content_hash(slide.content)
        if not force:
            existing = await self.image_repository.image_exists(slug, sid, content_hash)
            if existing:
                # Return existing image
                for img in slide.images:
                    if img.hash == content_hash:
                        return img

        # Get style image
        style_image = await self.style_repository.get_style_image(slug)
        if style_image is None:
            raise StyleNotSetError()

        # Generate new image (this is the slow part)
        logger.info("Generating image", extra={"slug": slug, "sid": sid})
        image_data = await self.gemini_service.generate_slide_image(
            content=slide.content,
            style_image=style_image,
            style_prompt=project.style.prompt,
        )

        # Create thumbnail
        thumbnail_data = self._create_thumbnail(image_data)

        # Save image and thumbnail
        path = await self.image_repository.save_image(slug, sid, content_hash, image_data)
        await self.image_repository.save_thumbnail(slug, sid, content_hash, thumbnail_data)

        # Create SlideImage record
        slide_image = SlideImage(
            hash=content_hash,
            path=path,
            created_at=datetime.now(),
        )

        # Re-read project data and update atomically to avoid race conditions
        # This ensures we don't overwrite changes made by concurrent requests
        updated_project = await self.slides_repository.get_or_create_project(slug)
        updated_slide = updated_project.get_slide(sid)
        if updated_slide is not None:
            # Check if image already exists (another request might have added it)
            if not any(img.hash == content_hash for img in updated_slide.images):
                updated_slide.images.append(slide_image)
            updated_project.cost.slide_generations += 1
            updated_project.cost.total_images += 1
            updated_project.cost.estimated_cost = (
                updated_project.cost.style_generations * 0.02
                + updated_project.cost.slide_generations * 0.02
            )
            updated_project.updated_at = datetime.now()
            await self.slides_repository.save_project(updated_project)

        return slide_image

    def get_content_hash(self, content: str) -> str:
        """Get the hash of slide content."""
        return compute_content_hash(content)

    def get_image_url(self, slug: str, sid: str, hash: str) -> str:
        """Get the URL for an image."""
        return self.image_repository.get_image_url(slug, sid, hash)

    def get_thumbnail_url(self, slug: str, sid: str, hash: str) -> str:
        """Get the URL for a thumbnail."""
        return self.image_repository.get_thumbnail_url(slug, sid, hash)

    def _create_thumbnail(self, image_data: bytes, size: tuple[int, int] = (320, 180)) -> bytes:
        """Create a thumbnail from image data."""
        image = Image.open(io.BytesIO(image_data))
        image.thumbnail(size, Image.Resampling.LANCZOS)

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=75)
        return buffer.getvalue()

    async def delete_image(self, slug: str, sid: str, image_hash: str) -> bool:
        """Delete an image from a slide.

        Args:
            slug: Project slug
            sid: Slide ID
            image_hash: Hash of the image to delete

        Returns:
            True if deleted successfully
        """
        project = await self.slides_repository.get_or_create_project(slug)
        slide = project.get_slide(sid)

        if slide is None:
            raise SlideNotFoundError(sid)

        # Check if image exists in slide
        image_to_delete = None
        for img in slide.images:
            if img.hash == image_hash:
                image_to_delete = img
                break

        if image_to_delete is None:
            raise ImageNotFoundError(image_hash)

        # Delete from file system
        await self.image_repository.delete_image(slug, sid, image_hash)

        # Remove from slide's images list
        slide.images = [img for img in slide.images if img.hash != image_hash]

        # Update project
        project.updated_at = datetime.now()
        await self.slides_repository.save_project(project)

        logger.info(
            "Image deleted",
            extra={"slug": slug, "sid": sid, "hash": image_hash},
        )

        return True
