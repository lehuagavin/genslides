"""Tests for slides API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_project_creates_new(client: AsyncClient) -> None:
    """Test that getting a non-existent project creates it."""
    response = await client.get("/api/slides/test-project")
    assert response.status_code == 200

    data = response.json()
    assert data["slug"] == "test-project"
    assert data["title"] == "Untitled"
    assert data["slides"] == []
    assert data["style"] is None


@pytest.mark.asyncio
async def test_update_title(client: AsyncClient) -> None:
    """Test updating project title."""
    # First create the project
    await client.get("/api/slides/test-project")

    # Update title
    response = await client.put(
        "/api/slides/test-project/title",
        json={"title": "My Presentation"},
    )
    assert response.status_code == 200

    data = response.json()
    assert data["title"] == "My Presentation"


@pytest.mark.asyncio
async def test_create_slide(client: AsyncClient) -> None:
    """Test creating a new slide."""
    # First create the project
    await client.get("/api/slides/test-project")

    # Create slide
    response = await client.post(
        "/api/slides/test-project",
        json={"content": "Hello World"},
    )
    assert response.status_code == 200

    data = response.json()
    assert data["content"] == "Hello World"
    assert data["sid"].startswith("slide-")


@pytest.mark.asyncio
async def test_update_slide(client: AsyncClient) -> None:
    """Test updating slide content."""
    # Create project and slide
    await client.get("/api/slides/test-project")
    create_response = await client.post(
        "/api/slides/test-project",
        json={"content": "Original content"},
    )
    sid = create_response.json()["sid"]

    # Update slide
    response = await client.put(
        f"/api/slides/test-project/{sid}",
        json={"content": "Updated content"},
    )
    assert response.status_code == 200

    data = response.json()
    assert data["content"] == "Updated content"


@pytest.mark.asyncio
async def test_delete_slide(client: AsyncClient) -> None:
    """Test deleting a slide."""
    # Create project and slide
    await client.get("/api/slides/test-project")
    create_response = await client.post(
        "/api/slides/test-project",
        json={"content": "To be deleted"},
    )
    sid = create_response.json()["sid"]

    # Delete slide
    response = await client.delete(f"/api/slides/test-project/{sid}")
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["deleted_sid"] == sid


@pytest.mark.asyncio
async def test_invalid_slug(client: AsyncClient) -> None:
    """Test that invalid slugs are rejected."""
    response = await client.get("/api/slides/invalid..slug")
    assert response.status_code == 400
