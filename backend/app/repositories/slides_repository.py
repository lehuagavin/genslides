"""Slides repository for managing project data persistence."""

import uuid
from asyncio import Lock
from datetime import datetime
from pathlib import Path
from typing import Any

import yaml

from app.models import CostInfo, Project, Slide, SlideImage, Style, StyleType
from app.utils import ensure_directory, file_exists, read_file, write_file


class SlidesRepository:
    """Repository for slides project data stored in YAML files."""

    def __init__(self, base_path: str = "./slides"):
        self.base_path = Path(base_path)
        self._locks: dict[str, Lock] = {}

    def _get_lock(self, slug: str) -> Lock:
        """Get or create a lock for a project."""
        if slug not in self._locks:
            self._locks[slug] = Lock()
        return self._locks[slug]

    def _get_project_path(self, slug: str) -> Path:
        """Get the path to a project's directory."""
        return self.base_path / slug

    def _get_outline_path(self, slug: str) -> Path:
        """Get the path to a project's outline.yml file."""
        return self._get_project_path(slug) / "outline.yml"

    async def project_exists(self, slug: str) -> bool:
        """Check if a project exists."""
        return await file_exists(self._get_outline_path(slug))

    async def get_project(self, slug: str) -> Project | None:
        """Load a project from disk."""
        outline_path = self._get_outline_path(slug)

        if not await file_exists(outline_path):
            return None

        async with self._get_lock(slug):
            content = await read_file(outline_path)
            data = yaml.safe_load(content)
            return self._parse_project(slug, data)

    async def save_project(self, project: Project) -> None:
        """Save a project to disk."""
        outline_path = self._get_outline_path(project.slug)

        async with self._get_lock(project.slug):
            await ensure_directory(outline_path.parent)
            data = self._serialize_project(project)
            content = yaml.dump(data, allow_unicode=True, default_flow_style=False)
            await write_file(outline_path, content)

    async def create_project(self, slug: str, title: str = "Untitled") -> Project:
        """Create a new project."""
        project = Project(
            slug=slug,
            title=title,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        await self.save_project(project)
        return project

    async def get_or_create_project(self, slug: str) -> Project:
        """Get an existing project or create a new one."""
        project = await self.get_project(slug)
        if project is None:
            project = await self.create_project(slug)
        return project

    async def list_projects(self) -> list[Project]:
        """List all existing projects."""
        projects = []
        if not self.base_path.exists():
            return projects

        for project_dir in self.base_path.iterdir():
            if project_dir.is_dir():
                outline_path = project_dir / "outline.yml"
                if outline_path.exists():
                    project = await self.get_project(project_dir.name)
                    if project:
                        projects.append(project)

        # Sort by updated_at descending (most recent first)
        projects.sort(key=lambda p: p.updated_at, reverse=True)
        return projects

    async def delete_project(self, slug: str) -> bool:
        """Delete a project and all its files."""
        import shutil

        project_path = self._get_project_path(slug)
        if not project_path.exists():
            return False

        async with self._get_lock(slug):
            # Remove the entire project directory
            shutil.rmtree(project_path)
            # Clean up the lock
            if slug in self._locks:
                del self._locks[slug]

        return True

    def generate_sid(self) -> str:
        """Generate a unique slide ID."""
        return f"slide-{uuid.uuid4().hex[:8]}"

    def _parse_project(self, slug: str, data: dict[str, Any]) -> Project:
        """Parse project data from YAML."""
        style = None
        if data.get("style"):
            # 解析 style_type（向后兼容）
            style_type = None
            if data["style"].get("style_type"):
                try:
                    style_type = StyleType(data["style"]["style_type"])
                except ValueError:
                    style_type = None

            style = Style(
                prompt=data["style"]["prompt"],
                image=data["style"]["image"],
                created_at=datetime.fromisoformat(data["style"]["created_at"]),
                style_type=style_type,
                style_name=data["style"].get("style_name"),
            )

        slides = []
        for slide_data in data.get("slides", []):
            images = [
                SlideImage(
                    hash=img["hash"],
                    path=img["path"],
                    created_at=datetime.fromisoformat(img["created_at"]),
                )
                for img in slide_data.get("images", [])
            ]
            slide = Slide(
                sid=slide_data["sid"],
                content=slide_data["content"],
                created_at=datetime.fromisoformat(slide_data["created_at"]),
                updated_at=datetime.fromisoformat(slide_data["updated_at"]),
                images=images,
                selected_image_hash=slide_data.get("selected_image_hash"),
            )
            slides.append(slide)

        cost_data = data.get("cost", {})
        cost = CostInfo(
            total_images=cost_data.get("total_images", 0),
            style_generations=cost_data.get("style_generations", 0),
            slide_generations=cost_data.get("slide_generations", 0),
            estimated_cost=cost_data.get("estimated_cost", 0.0),
        )

        return Project(
            slug=slug,
            title=data.get("title", "Untitled"),
            style=style,
            slides=slides,
            image_engine=data.get("image_engine", "volcengine"),
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"]),
            cost=cost,
        )

    def _serialize_project(self, project: Project) -> dict[str, Any]:
        """Serialize project to YAML-compatible dict."""
        data: dict[str, Any] = {
            "title": project.title,
            "image_engine": project.image_engine,
            "created_at": project.created_at.isoformat(),
            "updated_at": project.updated_at.isoformat(),
            "slides": [],
            "cost": {
                "total_images": project.cost.total_images,
                "style_generations": project.cost.style_generations,
                "slide_generations": project.cost.slide_generations,
                "estimated_cost": project.cost.estimated_cost,
            },
        }

        if project.style:
            style_data: dict[str, Any] = {
                "prompt": project.style.prompt,
                "image": project.style.image,
                "created_at": project.style.created_at.isoformat(),
            }
            # 只有当有值时才保存 style_type 和 style_name
            if project.style.style_type:
                style_data["style_type"] = project.style.style_type.value
            if project.style.style_name:
                style_data["style_name"] = project.style.style_name
            data["style"] = style_data

        for slide in project.slides:
            slide_data: dict[str, Any] = {
                "sid": slide.sid,
                "content": slide.content,
                "created_at": slide.created_at.isoformat(),
                "updated_at": slide.updated_at.isoformat(),
                "images": [
                    {
                        "hash": img.hash,
                        "path": img.path,
                        "created_at": img.created_at.isoformat(),
                    }
                    for img in slide.images
                ],
            }
            if slide.selected_image_hash:
                slide_data["selected_image_hash"] = slide.selected_image_hash
            data["slides"].append(slide_data)

        return data
