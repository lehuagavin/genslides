"""Style business logic service."""

from datetime import datetime

from app.exceptions import InvalidRequestError
from app.models import (
    STYLE_TEMPLATES,
    Project,
    Style,
    StyleCandidate,
    StyleTemplate,
    StyleType,
)
from app.repositories import SlidesRepository, StyleRepository
from app.services.gemini_service import GeminiService
from app.services.image_generation_service import ImageGenerationService
from app.services.volcengine_service import VolcEngineService


class StyleService:
    """Service for managing presentation styles."""

    def __init__(
        self,
        slides_repository: SlidesRepository,
        style_repository: StyleRepository,
        gemini_service: GeminiService,
        volcengine_service: VolcEngineService,
    ):
        self.slides_repository = slides_repository
        self.style_repository = style_repository
        self.gemini_service = gemini_service
        self.volcengine_service = volcengine_service

    def _get_engine(self, project: Project) -> ImageGenerationService:
        """Select image generation engine based on project configuration."""
        if project.image_engine == "gemini":
            return self.gemini_service
        return self.volcengine_service  # Default to VolcEngine

    @staticmethod
    def get_style_templates() -> list[StyleTemplate]:
        """获取所有预设风格模板"""
        return list(STYLE_TEMPLATES.values())

    @staticmethod
    def get_template_by_type(style_type: str) -> StyleTemplate | None:
        """根据类型获取风格模板"""
        try:
            enum_type = StyleType(style_type)
            return STYLE_TEMPLATES.get(enum_type)
        except ValueError:
            return None

    async def get_style(self, slug: str) -> Style | None:
        """Get the current style for a project."""
        project = await self.slides_repository.get_or_create_project(slug)
        return project.style

    async def generate_candidates(self, slug: str, prompt: str) -> list[StyleCandidate]:
        """Generate candidate style images."""
        # Ensure project exists
        project = await self.slides_repository.get_or_create_project(slug)

        # Select image generation engine based on project configuration
        engine = self._get_engine(project)

        # Generate images using selected engine
        images = await engine.generate_style_images(prompt, count=2)

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

    async def generate_candidates_from_template(
        self,
        slug: str,
        style_type: str,
        custom_prompt: str | None = None,
    ) -> tuple[list[StyleCandidate], StyleTemplate]:
        """
        基于预设模板生成风格候选

        Args:
            slug: 项目 slug
            style_type: 风格类型
            custom_prompt: 自定义提示词（可选，优先级高于模板默认）

        Returns:
            (候选列表, 使用的模板)
        """
        template = self.get_template_by_type(style_type)
        if not template:
            raise InvalidRequestError(f"Unknown style type: {style_type}")

        # 使用自定义提示词或模板的 preview_prompt（用于生成风格参考图）
        prompt = custom_prompt or template.preview_prompt

        # 调用现有生成逻辑
        candidates = await self.generate_candidates(slug, prompt)

        return candidates, template

    async def save_style(
        self,
        slug: str,
        prompt: str,
        candidate_id: str,
        style_type: str | None = None,
        style_name: str | None = None,
    ) -> Style:
        """Save a selected candidate as the project style."""
        project = await self.slides_repository.get_or_create_project(slug)

        # Promote candidate to main style
        result = await self.style_repository.promote_candidate(slug, candidate_id)
        if result is None:
            raise InvalidRequestError(f"Candidate '{candidate_id}' not found")

        # 解析风格类型
        parsed_style_type: StyleType | None = None
        if style_type:
            try:
                parsed_style_type = StyleType(style_type)
            except ValueError:
                parsed_style_type = StyleType.CUSTOM

        # Create and save style
        style = Style(
            prompt=prompt,
            image="style/style.jpg",
            created_at=datetime.now(),
            style_type=parsed_style_type,
            style_name=style_name,
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
