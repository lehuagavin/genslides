"""WebSocket routes for real-time updates."""

import logging
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """Manages WebSocket connections per project slug."""

    def __init__(self) -> None:
        self.active_connections: dict[str, list[WebSocket]] = {}
        # Track generating tasks: {slug: {sid: task_id}}
        self.generating_tasks: dict[str, dict[str, str]] = {}

    def add_generating_task(self, slug: str, sid: str, task_id: str) -> None:
        """Add a generating task to track."""
        if slug not in self.generating_tasks:
            self.generating_tasks[slug] = {}
        self.generating_tasks[slug][sid] = task_id

    def remove_generating_task(self, slug: str, sid: str) -> None:
        """Remove a generating task."""
        if slug in self.generating_tasks:
            self.generating_tasks[slug].pop(sid, None)
            if not self.generating_tasks[slug]:
                del self.generating_tasks[slug]

    def get_generating_sids(self, slug: str) -> list[str]:
        """Get list of sids that are currently generating."""
        return list(self.generating_tasks.get(slug, {}).keys())

    async def connect(self, slug: str, websocket: WebSocket) -> None:
        """Accept and register a WebSocket connection."""
        await websocket.accept()
        if slug not in self.active_connections:
            self.active_connections[slug] = []
        self.active_connections[slug].append(websocket)
        logger.info(
            "WebSocket connected",
            extra={"slug": slug, "total_connections": len(self.active_connections[slug])},
        )

        # Send current generating tasks to the new connection
        generating_sids = self.get_generating_sids(slug)
        if generating_sids:
            await websocket.send_json({
                "type": "sync_generating_tasks",
                "data": {"sids": generating_sids},
            })

    def disconnect(self, slug: str, websocket: WebSocket) -> None:
        """Remove a WebSocket connection."""
        if slug in self.active_connections:
            if websocket in self.active_connections[slug]:
                self.active_connections[slug].remove(websocket)
            if not self.active_connections[slug]:
                del self.active_connections[slug]
        logger.info("WebSocket disconnected", extra={"slug": slug})

    async def broadcast(self, slug: str, message: dict[str, Any]) -> None:
        """Broadcast a message to all connections for a slug."""
        if slug not in self.active_connections:
            return

        disconnected = []
        for connection in self.active_connections[slug]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning("Failed to send to WebSocket", extra={"error": str(e)})
                disconnected.append(connection)

        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(slug, connection)


# Global connection manager instance
manager = ConnectionManager()


@router.websocket("/ws/slides/{slug}")
async def websocket_endpoint(websocket: WebSocket, slug: str) -> None:
    """WebSocket endpoint for real-time updates."""
    await manager.connect(slug, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            # Handle ping messages
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        manager.disconnect(slug, websocket)
    except Exception as e:
        logger.exception("WebSocket error", extra={"slug": slug, "error": str(e)})
        manager.disconnect(slug, websocket)
