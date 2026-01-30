"""Images API routes."""

import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends

from app.api.dependencies import get_image_service, get_slides_service
from app.api.routes.websocket import manager
from app.api.schemas import (
    DeleteImageResponse,
    GenerateImageRequest,
    GenerateTaskResponse,
    GetImagesResponse,
    SlideImageResponse,
)
from app.services import ImageService, SlidesService
from app.utils import compute_content_hash

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/slides", tags=["images"])


@router.get("/{slug}/{sid}/images", response_model=GetImagesResponse)
async def get_images(
    slug: str,
    sid: str,
    service: Annotated[ImageService, Depends(get_image_service)],
    slides_service: Annotated[SlidesService, Depends(get_slides_service)],
) -> GetImagesResponse:
    """Get all images for a slide."""
    project = await slides_service.get_project(slug)
    slide = project.get_slide(sid)

    if slide is None:
        from app.exceptions import SlideNotFoundError

        raise SlideNotFoundError(sid)

    content_hash = compute_content_hash(slide.content)
    has_matched = any(img.hash == content_hash for img in slide.images)

    return GetImagesResponse(
        sid=sid,
        content_hash=content_hash,
        images=[
            SlideImageResponse(
                hash=img.hash,
                url=service.get_image_url(slug, sid, img.hash),
                thumbnail_url=service.get_thumbnail_url(slug, sid, img.hash),
                created_at=img.created_at.isoformat(),
                matched=img.hash == content_hash,
            )
            for img in slide.images
        ],
        has_matched_image=has_matched,
    )


@router.post("/{slug}/{sid}/generate", response_model=GenerateTaskResponse)
async def generate_image(
    slug: str,
    sid: str,
    request: GenerateImageRequest,
    background_tasks: BackgroundTasks,
    service: Annotated[ImageService, Depends(get_image_service)],
) -> GenerateTaskResponse:
    """Start async image generation for a slide."""
    task_id = str(uuid.uuid4())

    # Track the generating task
    manager.add_generating_task(slug, sid, task_id)

    # Notify clients that generation started
    await manager.broadcast(
        slug,
        {
            "type": "generation_started",
            "data": {"task_id": task_id, "sid": sid},
        },
    )

    # Run generation in background
    background_tasks.add_task(
        _generate_and_notify,
        slug,
        sid,
        task_id,
        request.force,
        service,
    )

    return GenerateTaskResponse(
        task_id=task_id,
        status="pending",
        message="Image generation task submitted",
    )


async def _generate_and_notify(
    slug: str,
    sid: str,
    task_id: str,
    force: bool,
    service: ImageService,
) -> None:
    """Generate image and notify via WebSocket."""
    try:
        logger.info(
            "Starting generation",
            extra={"slug": slug, "sid": sid, "task_id": task_id},
        )
        slide_image = await service.generate_image(slug, sid, force)

        # Remove from generating tasks
        manager.remove_generating_task(slug, sid)

        # Notify success
        await manager.broadcast(
            slug,
            {
                "type": "generation_completed",
                "data": {
                    "task_id": task_id,
                    "sid": sid,
                    "image": {
                        "hash": slide_image.hash,
                        "url": service.get_image_url(slug, sid, slide_image.hash),
                        "thumbnail_url": service.get_thumbnail_url(slug, sid, slide_image.hash),
                    },
                },
            },
        )

        logger.info("Generation completed", extra={"slug": slug, "sid": sid})

    except Exception as e:
        logger.exception("Generation failed", extra={"slug": slug, "sid": sid})

        # Remove from generating tasks
        manager.remove_generating_task(slug, sid)

        # Notify failure
        await manager.broadcast(
            slug,
            {
                "type": "generation_failed",
                "data": {
                    "task_id": task_id,
                    "sid": sid,
                    "error": str(e),
                },
            },
        )


@router.delete("/{slug}/{sid}/images/{image_hash}", response_model=DeleteImageResponse)
async def delete_image(
    slug: str,
    sid: str,
    image_hash: str,
    service: Annotated[ImageService, Depends(get_image_service)],
) -> DeleteImageResponse:
    """Delete an image from a slide."""
    await service.delete_image(slug, sid, image_hash)

    # Notify clients that image was deleted
    await manager.broadcast(
        slug,
        {
            "type": "image_deleted",
            "data": {"sid": sid, "hash": image_hash},
        },
    )

    return DeleteImageResponse(success=True, deleted_hash=image_hash)
