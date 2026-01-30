"""Style API routes."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_style_service
from app.api.schemas import (
    GenerateStyleRequest,
    GenerateStyleResponse,
    GetStyleResponse,
    SaveStyleRequest,
    SaveStyleResponse,
    StyleCandidateResponse,
    StyleResponse,
)
from app.services import StyleService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/slides", tags=["style"])


@router.get("/{slug}/style", response_model=GetStyleResponse)
async def get_style(
    slug: str,
    service: Annotated[StyleService, Depends(get_style_service)],
) -> GetStyleResponse:
    """Get the current style for a project."""
    style = await service.get_style(slug)

    if style is None:
        return GetStyleResponse(has_style=False, style=None)

    return GetStyleResponse(
        has_style=True,
        style=StyleResponse(
            prompt=style.prompt,
            image=service.get_style_url(slug),
            created_at=style.created_at.isoformat(),
        ),
    )


@router.post("/{slug}/style/generate", response_model=GenerateStyleResponse)
async def generate_style(
    slug: str,
    request: GenerateStyleRequest,
    service: Annotated[StyleService, Depends(get_style_service)],
) -> GenerateStyleResponse:
    """Generate candidate style images."""
    logger.info(
        "Generating style candidates",
        extra={"slug": slug, "prompt": request.prompt},
    )
    candidates = await service.generate_candidates(slug, request.prompt)

    return GenerateStyleResponse(
        candidates=[
            StyleCandidateResponse(
                id=c.id,
                url=service.get_candidate_url(slug, c.id),
            )
            for c in candidates
        ],
        prompt=request.prompt,
    )


@router.put("/{slug}/style", response_model=SaveStyleResponse)
async def save_style(
    slug: str,
    request: SaveStyleRequest,
    service: Annotated[StyleService, Depends(get_style_service)],
) -> SaveStyleResponse:
    """Save a selected candidate as the project style."""
    logger.info(
        "Saving style",
        extra={"slug": slug, "candidate_id": request.candidate_id},
    )
    style = await service.save_style(slug, request.prompt, request.candidate_id)

    return SaveStyleResponse(
        success=True,
        style=StyleResponse(
            prompt=style.prompt,
            image=service.get_style_url(slug),
            created_at=style.created_at.isoformat(),
        ),
    )
