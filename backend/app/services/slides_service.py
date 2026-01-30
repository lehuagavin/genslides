"""Slides business logic service."""

from datetime import datetime

from app.exceptions import InvalidRequestError, ProjectNotFoundError, SlideNotFoundError
from app.models import Project, Slide
from app.repositories import SlidesRepository
from app.utils import compute_content_hash, is_safe_name


class SlidesService:
    """Service for managing slides and projects."""

    def __init__(self, repository: SlidesRepository):
        self.repository = repository

    async def list_projects(self) -> list[Project]:
        """List all existing projects."""
        return await self.repository.list_projects()

    async def get_project(self, slug: str) -> Project:
        """Get a project by slug, creating it if it doesn't exist."""
        if not is_safe_name(slug):
            raise InvalidRequestError(f"Invalid project slug: {slug}")
        return await self.repository.get_or_create_project(slug)

    async def delete_project(self, slug: str) -> None:
        """Delete a project and all its files."""
        if not is_safe_name(slug):
            raise InvalidRequestError(f"Invalid project slug: {slug}")

        deleted = await self.repository.delete_project(slug)
        if not deleted:
            raise ProjectNotFoundError(slug)

    async def update_title(self, slug: str, title: str) -> Project:
        """Update project title."""
        project = await self.get_project(slug)
        project.title = title
        project.updated_at = datetime.now()
        await self.repository.save_project(project)
        return project

    async def create_slide(self, slug: str, content: str, after_sid: str | None = None) -> Slide:
        """Create a new slide."""
        project = await self.get_project(slug)

        slide = Slide(
            sid=self.repository.generate_sid(),
            content=content,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        if after_sid:
            index = project.get_slide_index(after_sid)
            if index == -1:
                raise SlideNotFoundError(after_sid)
            project.slides.insert(index + 1, slide)
        else:
            project.slides.append(slide)

        project.updated_at = datetime.now()
        await self.repository.save_project(project)
        return slide

    async def update_slide(self, slug: str, sid: str, content: str) -> Slide:
        """Update slide content."""
        project = await self.get_project(slug)
        slide = project.get_slide(sid)

        if slide is None:
            raise SlideNotFoundError(sid)

        slide.content = content
        slide.updated_at = datetime.now()
        project.updated_at = datetime.now()
        await self.repository.save_project(project)
        return slide

    async def delete_slide(self, slug: str, sid: str) -> None:
        """Delete a slide."""
        project = await self.get_project(slug)
        index = project.get_slide_index(sid)

        if index == -1:
            raise SlideNotFoundError(sid)

        project.slides.pop(index)
        project.updated_at = datetime.now()
        await self.repository.save_project(project)

    async def reorder_slides(self, slug: str, order: list[str]) -> list[Slide]:
        """Reorder slides according to the given order."""
        project = await self.get_project(slug)

        # Validate all sids exist
        existing_sids = {slide.sid for slide in project.slides}
        for sid in order:
            if sid not in existing_sids:
                raise SlideNotFoundError(sid)

        # Reorder slides
        slide_map = {slide.sid: slide for slide in project.slides}
        project.slides = [slide_map[sid] for sid in order]
        project.updated_at = datetime.now()
        await self.repository.save_project(project)
        return project.slides

    def get_content_hash(self, content: str) -> str:
        """Get the hash of slide content."""
        return compute_content_hash(content)
