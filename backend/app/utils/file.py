"""File operation utilities."""

import re
from pathlib import Path

import aiofiles
import aiofiles.os

# Safe characters for slug and sid
SAFE_PATTERN = re.compile(r"^[a-zA-Z0-9_-]+$")


def is_safe_name(name: str) -> bool:
    """Check if a name is safe for use as a file/directory name."""
    return bool(SAFE_PATTERN.match(name)) and len(name) <= 64


async def ensure_directory(path: Path) -> None:
    """Ensure a directory exists, creating it if necessary."""
    if not await aiofiles.os.path.exists(path):
        await aiofiles.os.makedirs(path, exist_ok=True)


async def read_file(path: Path) -> str:
    """Read a file as text."""
    async with aiofiles.open(path, encoding="utf-8") as f:
        return await f.read()


async def write_file(path: Path, content: str) -> None:
    """Write text to a file."""
    await ensure_directory(path.parent)
    async with aiofiles.open(path, "w", encoding="utf-8") as f:
        await f.write(content)


async def read_bytes(path: Path) -> bytes:
    """Read a file as bytes."""
    async with aiofiles.open(path, "rb") as f:
        return await f.read()


async def write_bytes(path: Path, content: bytes) -> None:
    """Write bytes to a file."""
    await ensure_directory(path.parent)
    async with aiofiles.open(path, "wb") as f:
        await f.write(content)


async def file_exists(path: Path) -> bool:
    """Check if a file exists."""
    return await aiofiles.os.path.exists(path)


async def list_files(path: Path, pattern: str = "*") -> list[Path]:
    """List files matching a pattern in a directory."""
    if not await aiofiles.os.path.exists(path):
        return []
    return list(path.glob(pattern))


async def delete_file(path: Path) -> bool:
    """Delete a file if it exists. Returns True if deleted, False if not found."""
    if await aiofiles.os.path.exists(path):
        await aiofiles.os.remove(path)
        return True
    return False
