"""Style API routes."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_style_service
from app.api.schemas import (
    GenerateStyleFromTemplateRequest,
    GenerateStyleFromTemplateResponse,
    GenerateStyleRequest,
    GenerateStyleResponse,
    GetStyleResponse,
    SaveStyleRequest,
    SaveStyleResponse,
    StyleCandidateResponse,
    StyleResponse,
    StyleTemplateResponse,
    StyleTemplatesResponse,
)
from app.services import StyleService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/slides", tags=["style"])

# 单独的风格模板路由（不依赖 slug）
templates_router = APIRouter(prefix="/style", tags=["style"])


@templates_router.get("/templates", response_model=StyleTemplatesResponse)
async def get_style_templates(
    service: Annotated[StyleService, Depends(get_style_service)],
) -> StyleTemplatesResponse:
    """获取所有可用的预设风格模板"""
    templates = service.get_style_templates()
    return StyleTemplatesResponse(
        templates=[
            StyleTemplateResponse(
                type=t.type.value,
                name=t.name,
                name_en=t.name_en,
                description=t.description,
                preview_prompt=t.preview_prompt,
            )
            for t in templates
        ]
    )


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
            style_type=style.style_type.value if style.style_type else None,
            style_name=style.style_name,
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


@router.post(
    "/{slug}/style/generate-from-template",
    response_model=GenerateStyleFromTemplateResponse,
)
async def generate_style_from_template(
    slug: str,
    request: GenerateStyleFromTemplateRequest,
    service: Annotated[StyleService, Depends(get_style_service)],
) -> GenerateStyleFromTemplateResponse:
    """基于预设模板生成风格候选图像"""
    logger.info(
        "Generating style from template",
        extra={"slug": slug, "style_type": request.style_type},
    )

    candidates, template = await service.generate_candidates_from_template(
        slug,
        request.style_type,
        request.custom_prompt,
    )

    return GenerateStyleFromTemplateResponse(
        candidates=[
            StyleCandidateResponse(
                id=c.id,
                url=service.get_candidate_url(slug, c.id),
            )
            for c in candidates
        ],
        template=StyleTemplateResponse(
            type=template.type.value,
            name=template.name,
            name_en=template.name_en,
            description=template.description,
            preview_prompt=template.preview_prompt,
        ),
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
    style = await service.save_style(
        slug,
        request.prompt,
        request.candidate_id,
        request.style_type,
        request.style_name,
    )

    return SaveStyleResponse(
        success=True,
        style=StyleResponse(
            prompt=style.prompt,
            image=service.get_style_url(slug),
            created_at=style.created_at.isoformat(),
            style_type=style.style_type.value if style.style_type else None,
            style_name=style.style_name,
        ),
    )
