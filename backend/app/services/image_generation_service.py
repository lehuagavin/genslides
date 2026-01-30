"""Image generation service protocol."""

from typing import Protocol


class ImageGenerationService(Protocol):
    """Protocol for image generation services.

    This defines the interface that all image generation services must implement.
    Both GeminiService and VolcEngineService implement this protocol.
    """

    async def generate_style_images(
        self,
        prompt: str,
        count: int = 2,
    ) -> list[bytes]:
        """Generate candidate style images from a prompt.

        Args:
            prompt: Style description prompt
            count: Number of images to generate (default 2)

        Returns:
            List of image bytes in JPEG format
        """
        ...

    async def generate_slide_image(
        self,
        content: str,
        style_image: bytes,
        style_prompt: str,
    ) -> bytes:
        """Generate a slide image based on content and style reference.

        Args:
            content: Slide text content
            style_image: Reference style image bytes
            style_prompt: Style description prompt

        Returns:
            Generated image bytes in JPEG format
        """
        ...
