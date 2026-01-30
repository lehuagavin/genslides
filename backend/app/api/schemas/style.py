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

    prompt: str = Field(..., min_length=1, max_length=1000)


class GenerateStyleResponse(BaseModel):
    """Response schema for style generation."""

    candidates: list[StyleCandidateResponse]
    prompt: str


class SaveStyleRequest(BaseModel):
    """Request schema for saving a style."""

    prompt: str = Field(..., min_length=1, max_length=1000)
    candidate_id: str


class SaveStyleResponse(BaseModel):
    """Response schema for saving style."""

    success: bool
    style: StyleResponse
