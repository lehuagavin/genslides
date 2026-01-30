"""API request/response schemas."""

from .images import DeleteImageResponse, GenerateImageRequest, GenerateTaskResponse, GetImagesResponse
from .slides import (
    CostResponse,
    CreateSlideRequest,
    DeleteProjectResponse,
    DeleteSlideResponse,
    GetEngineResponse,
    ProjectListResponse,
    ProjectResponse,
    ProjectSummaryResponse,
    ReorderSlidesRequest,
    ReorderSlidesResponse,
    SlideImageResponse,
    SlideResponse,
    StyleResponse,
    UpdateEngineRequest,
    UpdateEngineResponse,
    UpdateSlideRequest,
    UpdateTitleRequest,
    UpdateTitleResponse,
)
from .style import (
    GenerateStyleRequest,
    GenerateStyleResponse,
    GetStyleResponse,
    SaveStyleRequest,
    SaveStyleResponse,
    StyleCandidateResponse,
)

__all__ = [
    # Slides
    "CostResponse",
    "CreateSlideRequest",
    "DeleteProjectResponse",
    "DeleteSlideResponse",
    "GetEngineResponse",
    "ProjectListResponse",
    "ProjectResponse",
    "ProjectSummaryResponse",
    "ReorderSlidesRequest",
    "ReorderSlidesResponse",
    "SlideImageResponse",
    "SlideResponse",
    "StyleResponse",
    "UpdateEngineRequest",
    "UpdateEngineResponse",
    "UpdateSlideRequest",
    "UpdateTitleRequest",
    "UpdateTitleResponse",
    # Style
    "GenerateStyleRequest",
    "GenerateStyleResponse",
    "GetStyleResponse",
    "SaveStyleRequest",
    "SaveStyleResponse",
    "StyleCandidateResponse",
    # Images
    "DeleteImageResponse",
    "GenerateImageRequest",
    "GenerateTaskResponse",
    "GetImagesResponse",
]
