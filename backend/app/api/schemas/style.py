"""Pydantic schemas for style API."""

from pydantic import BaseModel, Field

from .slides import StyleResponse


class StyleCandidateResponse(BaseModel):
    """Response schema for a style candidate."""

    id: str
    url: str


class GetStyleResponse(BaseModel):
    """Response schema for getting style."""

    has_style: bool
    style: StyleResponse | None = None


class GenerateStyleRequest(BaseModel):
    """Request schema for generating style candidates."""

    prompt: str = Field(..., min_length=1, max_length=5000)


class GenerateStyleResponse(BaseModel):
    """Response schema for style generation."""

    candidates: list[StyleCandidateResponse]
    prompt: str


class SaveStyleRequest(BaseModel):
    """Request schema for saving a style."""

    prompt: str = Field(..., min_length=1, max_length=5000)
    candidate_id: str
    style_type: str | None = None  # 风格类型（可选）
    style_name: str | None = None  # 风格名称（可选）


class SaveStyleResponse(BaseModel):
    """Response schema for saving style."""

    success: bool
    style: StyleResponse


# ============================================
# 风格模板相关 Schema
# ============================================


class StyleTemplateResponse(BaseModel):
    """Response schema for a style template."""

    type: str
    name: str
    name_en: str
    description: str
    preview_prompt: str


class StyleTemplatesResponse(BaseModel):
    """Response schema for getting all style templates."""

    templates: list[StyleTemplateResponse]


class GenerateStyleFromTemplateRequest(BaseModel):
    """Request schema for generating style from template."""

    style_type: str
    custom_prompt: str | None = None  # 用户编辑后的提示词（可选）


class GenerateStyleFromTemplateResponse(BaseModel):
    """Response schema for generating style from template."""

    candidates: list[StyleCandidateResponse]
    template: StyleTemplateResponse
