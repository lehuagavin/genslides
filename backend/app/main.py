"""FastAPI application entry point."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api import images_router, slides_router, style_router, websocket_router
from app.config import get_settings
from app.exceptions import AppError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager."""
    # Startup
    logger.info("GenSlides API starting up...", extra={"phase": "startup"})
    logger.info(
        "Slides base path configured",
        extra={"slides_base_path": settings.slides_base_path},
    )

    # Ensure slides directory exists
    Path(settings.slides_base_path).mkdir(parents=True, exist_ok=True)

    yield

    # Shutdown
    logger.info("GenSlides API shutting down...", extra={"phase": "shutdown"})


# Create FastAPI app
app = FastAPI(
    title="GenSlides API",
    description="AI-powered slide generation API",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(AppError)
async def app_exception_handler(request: Request, exc: AppError) -> JSONResponse:
    """Handle application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle validation exceptions with detailed logging."""
    logger.error(
        "Validation error",
        extra={
            "url": str(request.url),
            "method": request.method,
            "errors": exc.errors(),
        },
    )
    # Return first error message for user-friendly response
    errors = exc.errors()
    if errors:
        first_error = errors[0]
        field = ".".join(str(loc) for loc in first_error.get("loc", []))
        msg = first_error.get("msg", "Validation failed")
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": f"{field}: {msg}",
                    "details": errors,
                }
            },
        )
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation failed",
            }
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions."""
    logger.exception("Unhandled exception")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
            }
        },
    )


# Include routers
# Style router must be before slides router to avoid route conflicts
# (slides has /{slug}/{sid} which would match /{slug}/style)
app.include_router(style_router, prefix="/api")
app.include_router(slides_router, prefix="/api")
app.include_router(images_router, prefix="/api")
app.include_router(websocket_router)

# Ensure slides directory exists and mount static files
slides_path = Path(settings.slides_base_path)
slides_path.mkdir(parents=True, exist_ok=True)
app.mount(
    "/static/slides",
    StaticFiles(directory=str(slides_path)),
    name="slides",
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.server_host,
        port=settings.server_port,
        reload=True,
    )
