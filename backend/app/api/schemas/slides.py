"""Pydantic schemas for slides API."""

from pydantic import BaseModel, Field


class SlideImageResponse(BaseModel):
    """Response schema for a slide image."""

    hash: str
    url: str
    thumbnail_url: str | None = None
    created_at: str
    matched: bool


class SlideResponse(BaseModel):
    """Response schema for a slide."""

    sid: str
    content: str
    created_at: str
    updated_at: str
    current_image: SlideImageResponse | None = None
    images: list[SlideImageResponse] = []  # All generated images for this slide


class StyleResponse(BaseModel):
    """Response schema for style."""

    prompt: str
    image: str
    created_at: str


class CostResponse(BaseModel):
    """Response schema for cost information."""

    total_images: int
    style_generations: int = 0
    slide_generations: int = 0
    estimated_cost: float
    currency: str = "USD"
    breakdown: dict[str, float] | None = None


class ProjectResponse(BaseModel):
    """Response schema for a project."""

    slug: str
    title: str
    created_at: str
    updated_at: str
    style: StyleResponse | None = None
    slides: list[SlideResponse]
    cost: CostResponse


class UpdateTitleRequest(BaseModel):
    """Request schema for updating project title."""

    title: str = Field(..., min_length=1, max_length=200)


class UpdateTitleResponse(BaseModel):
    """Response schema for title update."""

    slug: str
    title: str
    updated_at: str


class CreateSlideRequest(BaseModel):
    """Request schema for creating a slide."""

    content: str = Field(default="", max_length=20000)
    after_sid: str | None = None


class UpdateSlideRequest(BaseModel):
    """Request schema for updating slide content."""

    content: str = Field(..., max_length=20000)


class ReorderSlidesRequest(BaseModel):
    """Request schema for reordering slides."""

    order: list[str]


class ReorderSlidesResponse(BaseModel):
    """Response schema for reorder operation."""

    success: bool
    slides: list[SlideResponse]


class DeleteSlideResponse(BaseModel):
    """Response schema for delete operation."""

    success: bool
    deleted_sid: str


class DeleteProjectResponse(BaseModel):
    """Response schema for project delete operation."""

    success: bool
    deleted_slug: str


class ProjectSummaryResponse(BaseModel):
    """Response schema for project summary in list."""

    slug: str
    title: str
    created_at: str
    updated_at: str
    slide_count: int
    has_style: bool


class ProjectListResponse(BaseModel):
    """Response schema for project list."""

    projects: list[ProjectSummaryResponse]
