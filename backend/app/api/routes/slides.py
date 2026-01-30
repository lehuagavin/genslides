"""Slides API routes."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_cost_service, get_slides_service
from app.api.schemas import (
    CostResponse,
    CreateSlideRequest,
    DeleteProjectResponse,
    DeleteSlideResponse,
    ProjectListResponse,
    ProjectResponse,
    ProjectSummaryResponse,
    ReorderSlidesRequest,
    ReorderSlidesResponse,
    SlideImageResponse,
    SlideResponse,
    StyleResponse,
    UpdateSlideRequest,
    UpdateTitleRequest,
    UpdateTitleResponse,
)
from app.models import Slide
from app.services import CostService, SlidesService
from app.utils import compute_content_hash

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/slides", tags=["slides"])


def _slide_to_response(slide: Slide, slug: str) -> SlideResponse:
    """Convert a Slide model to response schema."""
    current_image = None
    content_hash = compute_content_hash(slide.content)

    # Build list of all images
    all_images: list[SlideImageResponse] = []
    for img in slide.images:
        all_images.append(
            SlideImageResponse(
                hash=img.hash,
                url=f"/static/slides/{slug}/{img.path}",
                thumbnail_url=f"/static/slides/{slug}/images/{slide.sid}/{img.hash}_thumb.jpg",
                created_at=img.created_at.isoformat(),
                matched=img.hash == content_hash,
            )
        )

    # Current image is the latest one
    if all_images:
        current_image = all_images[-1]

    return SlideResponse(
        sid=slide.sid,
        content=slide.content,
        created_at=slide.created_at.isoformat(),
        updated_at=slide.updated_at.isoformat(),
        current_image=current_image,
        images=all_images,
    )


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    service: Annotated[SlidesService, Depends(get_slides_service)],
) -> ProjectListResponse:
    """List all existing projects."""
    projects = await service.list_projects()
    return ProjectListResponse(
        projects=[
            ProjectSummaryResponse(
                slug=p.slug,
                title=p.title,
                created_at=p.created_at.isoformat(),
                updated_at=p.updated_at.isoformat(),
                slide_count=len(p.slides),
                has_style=p.style is not None,
            )
            for p in projects
        ]
    )


@router.get("/{slug}", response_model=ProjectResponse)
async def get_project(
    slug: str,
    service: Annotated[SlidesService, Depends(get_slides_service)],
    cost_service: Annotated[CostService, Depends(get_cost_service)],
) -> ProjectResponse:
    """Get project information, creating it if it doesn't exist."""
    project = await service.get_project(slug)

    style_response: StyleResponse | None = None
    if project.style:
        style_response = StyleResponse(
            prompt=project.style.prompt,
            image=f"/static/slides/{slug}/{project.style.image}",
            created_at=project.style.created_at.isoformat(),
        )

    return ProjectResponse(
        slug=project.slug,
        title=project.title,
        created_at=project.created_at.isoformat(),
        updated_at=project.updated_at.isoformat(),
        style=style_response,
        slides=[_slide_to_response(s, slug) for s in project.slides],
        cost=CostResponse(
            total_images=project.cost.total_images,
            style_generations=project.cost.style_generations,
            slide_generations=project.cost.slide_generations,
            estimated_cost=project.cost.estimated_cost,
            breakdown=cost_service.get_breakdown(project.cost),
        ),
    )


@router.delete("/{slug}", response_model=DeleteProjectResponse)
async def delete_project(
    slug: str,
    service: Annotated[SlidesService, Depends(get_slides_service)],
) -> DeleteProjectResponse:
    """Delete a project and all its files."""
    await service.delete_project(slug)
    return DeleteProjectResponse(success=True, deleted_slug=slug)


@router.put("/{slug}/title", response_model=UpdateTitleResponse)
async def update_title(
    slug: str,
    request: UpdateTitleRequest,
    service: Annotated[SlidesService, Depends(get_slides_service)],
) -> UpdateTitleResponse:
    """Update project title."""
    project = await service.update_title(slug, request.title)
    return UpdateTitleResponse(
        slug=project.slug,
        title=project.title,
        updated_at=project.updated_at.isoformat(),
    )


@router.post("/{slug}", response_model=SlideResponse)
async def create_slide(
    slug: str,
    request: CreateSlideRequest,
    service: Annotated[SlidesService, Depends(get_slides_service)],
) -> SlideResponse:
    """Create a new slide."""
    slide = await service.create_slide(slug, request.content, request.after_sid)
    return _slide_to_response(slide, slug)


@router.put("/{slug}/reorder", response_model=ReorderSlidesResponse)
async def reorder_slides(
    slug: str,
    request: ReorderSlidesRequest,
    service: Annotated[SlidesService, Depends(get_slides_service)],
) -> ReorderSlidesResponse:
    """Reorder slides."""
    slides = await service.reorder_slides(slug, request.order)
    return ReorderSlidesResponse(
        success=True,
        slides=[_slide_to_response(s, slug) for s in slides],
    )


@router.put("/{slug}/{sid}", response_model=SlideResponse)
async def update_slide(
    slug: str,
    sid: str,
    request: UpdateSlideRequest,
    service: Annotated[SlidesService, Depends(get_slides_service)],
) -> SlideResponse:
    """Update slide content."""
    slide = await service.update_slide(slug, sid, request.content)
    return _slide_to_response(slide, slug)


@router.delete("/{slug}/{sid}", response_model=DeleteSlideResponse)
async def delete_slide(
    slug: str,
    sid: str,
    service: Annotated[SlidesService, Depends(get_slides_service)],
) -> DeleteSlideResponse:
    """Delete a slide."""
    await service.delete_slide(slug, sid)
    return DeleteSlideResponse(success=True, deleted_sid=sid)


@router.get("/{slug}/cost", response_model=CostResponse)
async def get_cost(
    slug: str,
    service: Annotated[SlidesService, Depends(get_slides_service)],
    cost_service: Annotated[CostService, Depends(get_cost_service)],
) -> CostResponse:
    """Get cost information for a project."""
    project = await service.get_project(slug)
    return CostResponse(
        total_images=project.cost.total_images,
        style_generations=project.cost.style_generations,
        slide_generations=project.cost.slide_generations,
        estimated_cost=project.cost.estimated_cost,
        breakdown=cost_service.get_breakdown(project.cost),
    )
