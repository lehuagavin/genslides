"""Pytest configuration and fixtures."""

import asyncio
from collections.abc import AsyncGenerator, Generator
from pathlib import Path
from tempfile import TemporaryDirectory

import pytest
from httpx import ASGITransport, AsyncClient

from app.config import Settings, get_settings
from app.main import app


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an event loop for the test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def temp_slides_dir() -> Generator[Path, None, None]:
    """Create a temporary directory for slides."""
    with TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def test_settings(temp_slides_dir: Path) -> Settings:
    """Create test settings with temporary directory."""
    return Settings(
        gemini_api_key="test-api-key",
        slides_base_path=str(temp_slides_dir),
        server_host="127.0.0.1",
        server_port=3003,
        cors_origins=["http://localhost:5173"],
    )


@pytest.fixture
async def client(test_settings: Settings) -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP client for testing."""
    # Override settings
    app.dependency_overrides[get_settings] = lambda: test_settings

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    # Clear overrides
    app.dependency_overrides.clear()
