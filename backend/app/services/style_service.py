"""Style business logic service."""

from datetime import datetime

from app.exceptions import InvalidRequestError
from app.models import Style, StyleCandidate
from app.repositories import SlidesRepository, StyleRepository
from app.services.gemini_service import GeminiService


class StyleService:
    """Service for managing presentation styles."""

    def __init__(
        self,
        slides_repository: SlidesRepository,
        style_repository: StyleRepository,
        gemini_service: GeminiService,
    ):
        self.slides_repository = slides_repository
        self.style_repository = style_repository
        self.gemini_service = gemini_service

    async def get_style(self, slug: str) -> Style | None:
        """Get the current style for a project."""
        project = await self.slides_repository.get_or_create_project(slug)
        return project.style

    async def generate_candidates(self, slug: str, prompt: str) -> list[StyleCandidate]:
        """Generate candidate style images."""
        # Ensure project exists
        project = await self.slides_repository.get_or_create_project(slug)

        # Generate images using Gemini
        images = await self.gemini_service.generate_style_images(prompt, count=2)

        # Save candidates
        candidates = []
        for image_data in images:
            candidate_id = await self.style_repository.save_candidate(slug, image_data)
            candidates.append(
                StyleCandidate(
                    id=candidate_id,
                    path=f"style/candidates/{candidate_id}.jpg",
                )
            )

        # Update cost tracking
        project.cost.style_generations += len(images)
        project.cost.total_images += len(images)
        project.cost.estimated_cost = (
            project.cost.style_generations * 0.02 + project.cost.slide_generations * 0.02
        )
        await self.slides_repository.save_project(project)

        return candidates

    async def save_style(self, slug: str, prompt: str, candidate_id: str) -> Style:
        """Save a selected candidate as the project style."""
        project = await self.slides_repository.get_or_create_project(slug)

        # Promote candidate to main style
        result = await self.style_repository.promote_candidate(slug, candidate_id)
        if result is None:
            raise InvalidRequestError(f"Candidate '{candidate_id}' not found")

        # Create and save style
        style = Style(
            prompt=prompt,
            image="style/style.jpg",
            created_at=datetime.now(),
        )
        project.style = style
        project.updated_at = datetime.now()
        await self.slides_repository.save_project(project)

        # Clear candidates
        await self.style_repository.clear_candidates(slug)

        return style

    def get_style_url(self, slug: str) -> str:
        """Get the URL for the style image."""
        return self.style_repository.get_style_url(slug)

    def get_candidate_url(self, slug: str, candidate_id: str) -> str:
        """Get the URL for a candidate image."""
        return self.style_repository.get_candidate_url(slug, candidate_id)
