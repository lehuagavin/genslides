"""Custom application exceptions."""


class AppError(Exception):
    """Base application exception."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class ProjectNotFoundError(AppError):
    """Raised when a project is not found."""

    def __init__(self, slug: str):
        super().__init__(
            code="PROJECT_NOT_FOUND",
            message=f"Project '{slug}' not found",
            status_code=404,
        )


class SlideNotFoundError(AppError):
    """Raised when a slide is not found."""

    def __init__(self, sid: str):
        super().__init__(
            code="SLIDE_NOT_FOUND",
            message=f"Slide '{sid}' not found",
            status_code=404,
        )


class ImageNotFoundError(AppError):
    """Raised when an image is not found."""

    def __init__(self, image_hash: str):
        super().__init__(
            code="IMAGE_NOT_FOUND",
            message=f"Image '{image_hash}' not found",
            status_code=404,
        )


class StyleNotSetError(AppError):
    """Raised when style is required but not set."""

    def __init__(self) -> None:
        super().__init__(
            code="STYLE_NOT_SET",
            message="Style has not been set for this project",
            status_code=400,
        )


class InvalidRequestError(AppError):
    """Raised for invalid request parameters."""

    def __init__(self, message: str):
        super().__init__(
            code="INVALID_REQUEST",
            message=message,
            status_code=400,
        )


class GenerationFailedError(AppError):
    """Raised when image generation fails."""

    def __init__(self, message: str = "Image generation failed"):
        super().__init__(
            code="GENERATION_FAILED",
            message=message,
            status_code=500,
        )


class GeminiAPIError(AppError):
    """Raised when Gemini API call fails."""

    def __init__(self, message: str = "Gemini API call failed"):
        super().__init__(
            code="GEMINI_API_ERROR",
            message=message,
            status_code=502,
        )
