"""Hash utilities using blake3."""

import blake3


def compute_content_hash(content: str) -> str:
    """Compute blake3 hash of content, returning first 16 hex characters."""
    return blake3.blake3(content.encode("utf-8")).hexdigest()[:16]


def compute_bytes_hash(data: bytes) -> str:
    """Compute blake3 hash of bytes, returning first 16 hex characters."""
    return blake3.blake3(data).hexdigest()[:16]
