"""Pydantic schemas for images API."""

from pydantic import BaseModel

from .slides import SlideImageResponse


class GetImagesResponse(BaseModel):
    """Response schema for getting slide images."""

    sid: str
    content_hash: str
    images: list[SlideImageResponse]
    has_matched_image: bool


class GenerateImageRequest(BaseModel):
    """Request schema for generating an image."""

    force: bool = False


class GenerateTaskResponse(BaseModel):
    """Response schema for async generation task."""

    task_id: str
    status: str
    message: str


class DeleteImageResponse(BaseModel):
    """Response schema for deleting an image."""

    success: bool
    deleted_hash: str
