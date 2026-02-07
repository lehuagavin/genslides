"""Export service for generating ZIP archives of project slides."""

import io
import logging
import zipfile

from app.repositories import ImageRepository, SlidesRepository
from app.utils import is_safe_name

logger = logging.getLogger(__name__)


class ExportService:
    """Service for exporting project slides as ZIP with numbered JPG images."""

    def __init__(
        self,
        slides_repository: SlidesRepository,
        image_repository: ImageRepository,
    ):
        self.slides_repository = slides_repository
        self.image_repository = image_repository

    async def export_zip(self, slug: str) -> bytes:
        """Export project slides as a ZIP archive with numbered JPG images.

        Each slide's selected image (or latest image) is included.
        Images are named 01.jpg, 02.jpg, 03.jpg, etc.
        Slides without images are skipped.

        Args:
            slug: Project slug

        Returns:
            ZIP file bytes
        """
        from app.exceptions import InvalidRequestError, ProjectNotFoundError

        if not is_safe_name(slug):
            raise InvalidRequestError(f"Invalid project slug: {slug}")

        project = await self.slides_repository.get_project(slug)
        if project is None:
            raise ProjectNotFoundError(slug)

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_STORED) as zf:
            index = 1
            for slide in project.slides:
                # Get the selected image (falls back to latest)
                selected = slide.get_selected_image()
                if selected is None:
                    continue

                # Read image data from disk
                image_data = await self.image_repository.get_image(
                    slug, slide.sid, selected.hash
                )
                if image_data is None:
                    logger.warning(
                        "Image file not found on disk",
                        extra={"slug": slug, "sid": slide.sid, "hash": selected.hash},
                    )
                    continue

                # Write to ZIP with numbered filename
                filename = f"{index:02d}.jpg"
                zf.writestr(filename, image_data)
                index += 1

        logger.info(
            "Exported project as ZIP",
            extra={"slug": slug, "image_count": index - 1},
        )

        return buffer.getvalue()
