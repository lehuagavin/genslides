# GenSlides Backend - Development Guidelines

IMPORTANT: always use latest version of all dependencies.

## Technology Stack

- **Language**: Python 3.12+
- **Framework**: FastAPI
- **Package Manager**: uv
- **Async Runtime**: uvicorn with uvloop

## Architecture Principles

### SOLID Principles

1. **Single Responsibility**: Each module/class has one reason to change
   - `services/` - Business logic only
   - `repositories/` - Data access only
   - `api/routes/` - HTTP handling only
   - `api/schemas/` - Request/Response validation only

2. **Open/Closed**: Extend behavior through composition, not modification
   - Use dependency injection for services
   - Define abstract interfaces where needed

3. **Liskov Substitution**: Subtypes must be substitutable for base types
   - Use Protocol classes for type hints when defining interfaces

4. **Interface Segregation**: Prefer small, focused interfaces
   - Split large service classes into smaller, focused ones

5. **Dependency Inversion**: Depend on abstractions, not concretions
   - Inject dependencies via FastAPI's `Depends()`
   - Services receive repositories via constructor injection

### Other Principles

- **KISS**: Keep solutions simple; avoid premature optimization
- **YAGNI**: Don't implement features until actually needed
- **DRY**: Extract common logic into utilities, but avoid over-abstraction

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry, middleware, startup/shutdown
│   ├── config.py            # Settings via pydantic-settings
│   │
│   ├── api/                  # API Layer
│   │   ├── routes/           # Route handlers (thin, delegate to services)
│   │   ├── schemas/          # Pydantic models for request/response
│   │   └── dependencies.py   # FastAPI dependency functions
│   │
│   ├── services/             # Business Layer
│   │   ├── slides_service.py
│   │   ├── style_service.py
│   │   ├── image_service.py
│   │   ├── gemini_service.py
│   │   └── cost_service.py
│   │
│   ├── repositories/         # Data Access Layer
│   │   ├── slides_repository.py
│   │   ├── style_repository.py
│   │   └── image_repository.py
│   │
│   ├── models/               # Domain Models (dataclasses)
│   │   ├── slide.py
│   │   ├── style.py
│   │   └── project.py
│   │
│   └── utils/                # Pure utility functions
│       ├── hash.py
│       └── file.py
│
├── tests/
├── pyproject.toml
└── uv.lock
```

## Coding Standards

### Type Hints

Always use type hints for function signatures and class attributes:

```python
from typing import Optional

async def get_project(self, slug: str) -> Optional[Project]:
    ...
```

### Async/Await

- Use `async def` for all route handlers and service methods
- Use `asyncio.gather()` for concurrent operations
- Avoid blocking calls in async functions; use `run_in_executor` if needed

```python
# Good: Concurrent image generation
images = await asyncio.gather(*[
    self.generate_single_image(prompt) for _ in range(count)
])

# Bad: Sequential
images = []
for _ in range(count):
    img = await self.generate_single_image(prompt)
    images.append(img)
```

### Pydantic Models

- Use `BaseModel` for API schemas
- Use `@dataclass` for internal domain models
- Validate at API boundaries, trust internal data

```python
# api/schemas/slides.py
from pydantic import BaseModel, Field

class SlideCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000)
    after_sid: str | None = None
```

### Dependency Injection

```python
# api/dependencies.py
from functools import lru_cache

@lru_cache
def get_settings() -> Settings:
    return Settings()

def get_slides_service(
    settings: Settings = Depends(get_settings)
) -> SlidesService:
    repository = SlidesRepository(settings.slides_base_path)
    return SlidesService(repository)

# api/routes/slides.py
@router.get("/{slug}")
async def get_project(
    slug: str,
    service: SlidesService = Depends(get_slides_service)
) -> ProjectResponse:
    return await service.get_project(slug)
```

## Concurrency Handling

### WebSocket Management

- Use a connection manager class to track active connections
- Broadcast updates to all connected clients for a slug
- Handle disconnections gracefully

```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def broadcast(self, slug: str, message: dict):
        for connection in self.active_connections.get(slug, []):
            await connection.send_json(message)
```

### Background Tasks

- Use FastAPI's `BackgroundTasks` for fire-and-forget operations
- Use `asyncio.create_task()` for tasks that need to notify via WebSocket

```python
@router.post("/{slug}/{sid}/generate")
async def generate_image(
    slug: str,
    sid: str,
    background_tasks: BackgroundTasks,
    service: ImageService = Depends(get_image_service)
):
    task_id = str(uuid4())
    background_tasks.add_task(service.generate_and_notify, slug, sid, task_id)
    return {"task_id": task_id, "status": "pending"}
```

### File System Access

- Use `aiofiles` for async file I/O
- Use locks when writing to shared files (outline.yml)

```python
import aiofiles
from asyncio import Lock

class SlidesRepository:
    def __init__(self, base_path: str):
        self._locks: dict[str, Lock] = {}

    async def save_project(self, project: Project) -> None:
        lock = self._locks.setdefault(project.slug, Lock())
        async with lock:
            async with aiofiles.open(path, 'w') as f:
                await f.write(yaml.dump(data))
```

## Error Handling

### Custom Exceptions

Define domain-specific exceptions:

```python
# app/exceptions.py
class AppException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

class ProjectNotFoundError(AppException):
    def __init__(self, slug: str):
        super().__init__(
            code="PROJECT_NOT_FOUND",
            message=f"Project '{slug}' not found",
            status_code=404
        )
```

### Exception Handlers

Register global exception handlers in `main.py`:

```python
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}}
    )
```

### Error Propagation

- Services raise domain exceptions
- Routes let exceptions propagate to global handlers
- Don't catch exceptions just to re-raise them

## Logging

### Configuration

Use Python's `logging` module with structured output:

```python
# app/main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

logger = logging.getLogger(__name__)
```

### Best Practices

- Use appropriate log levels: DEBUG, INFO, WARNING, ERROR
- Include context in log messages (slug, sid, task_id)
- Log at service boundaries, not within utilities

```python
# Good
logger.info("Generating image", extra={"slug": slug, "sid": sid})

# Bad
logger.info(f"Generating image for {slug}/{sid}")  # No structured data
```

## Testing

### Structure

- Unit tests for services and utilities
- Integration tests for API routes
- Use `pytest-asyncio` for async tests

```python
# tests/test_slides.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_project(client: AsyncClient):
    response = await client.get("/api/slides/test-project")
    assert response.status_code == 200
```

### Fixtures

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
```

## Common Commands

```bash
# Install dependencies
uv sync --all-extras

# Run development server
uv run uvicorn app.main:app --reload --port 3003

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=app --cov-report=html

# Lint and format
uv run ruff check . --fix
uv run ruff format .

# Type check
uv run mypy app/
```
