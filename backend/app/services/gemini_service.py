"""Gemini API service for image generation."""

import asyncio
import io
import logging
from typing import TYPE_CHECKING, Any

from PIL import Image

from app.exceptions import GeminiAPIError

if TYPE_CHECKING:
    from google import genai

logger = logging.getLogger(__name__)

# Gemini image generation model
# - gemini-2.5-flash-image: faster, may hit quota limits
# - gemini-3-pro-image-preview: slower, often overloaded
IMAGE_MODEL = "gemini-3-pro-image-preview"

# API timeout in seconds
API_TIMEOUT = 60


class GeminiService:
    """Service for interacting with Google Gemini API."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    def _create_client(self) -> "genai.Client":
        """Create a new Gemini client (thread-safe for use in executor)."""
        from google import genai
        from google.genai import types

        return genai.Client(
            api_key=self.api_key,
            http_options=types.HttpOptions(timeout=API_TIMEOUT * 1000),  # ms
        )

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
        full_prompt = f"""
Generate a presentation slide background image with the following style:
{prompt}

Requirements:
- Create a visually appealing, clean background suitable for slides
- Keep the design minimal and professional
- Leave space for text overlay
- Use consistent color palette
- 16:9 aspect ratio
"""

        # Generate images concurrently
        tasks = [self._generate_single_image(full_prompt) for _ in range(count)]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        images = []
        for result in results:
            if isinstance(result, bytes):
                images.append(result)
            elif isinstance(result, Exception):
                logger.error(
                    "Failed to generate style image",
                    extra={"error": str(result)},
                )

        if not images:
            raise GeminiAPIError("Failed to generate any style images")

        return images

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
        # Load style reference image
        style_pil = Image.open(io.BytesIO(style_image))

        full_prompt = f"""
Generate a presentation slide image with the following content and style.

CONTENT:
{content}

STYLE REQUIREMENTS:
{style_prompt}

INSTRUCTIONS:
- Match the visual style of the reference image exactly
- Include the content text in a readable, well-positioned manner
- Maintain 16:9 aspect ratio
- Keep the design clean and professional
- Ensure good contrast between text and background
"""

        return await self._generate_image_with_reference(full_prompt, style_pil)

    async def _generate_single_image(self, prompt: str) -> bytes:
        """Generate a single image from prompt."""
        try:
            from google.genai import types

            def _call_api() -> Any:
                """Call Gemini API in executor (each call gets fresh client)."""
                client = self._create_client()
                return client.models.generate_content(
                    model=IMAGE_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE", "TEXT"],
                    ),
                )

            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, _call_api)

            # Extract image from response
            if response.candidates:
                content = response.candidates[0].content
                if content and content.parts:
                    for part in content.parts:
                        if part.inline_data is not None and part.inline_data.data:
                            # Convert to JPEG bytes
                            image = Image.open(io.BytesIO(part.inline_data.data))
                            buffer = io.BytesIO()
                            image.convert("RGB").save(buffer, format="JPEG", quality=85)
                            return buffer.getvalue()

            raise GeminiAPIError("No image in response")

        except GeminiAPIError:
            raise
        except Exception as e:
            logger.exception("Gemini API error")
            raise GeminiAPIError(str(e)) from e

    async def _generate_image_with_reference(self, prompt: str, reference: Image.Image) -> bytes:
        """Generate an image with a reference style image."""
        try:
            from google.genai import types

            def _call_api() -> Any:
                """Call Gemini API in executor (each call gets fresh client)."""
                client = self._create_client()
                return client.models.generate_content(
                    model=IMAGE_MODEL,
                    contents=[prompt, reference],  # type: ignore[arg-type]
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE", "TEXT"],
                    ),
                )

            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, _call_api)

            # Extract image from response
            if response.candidates:
                content = response.candidates[0].content
                if content and content.parts:
                    for part in content.parts:
                        if part.inline_data is not None and part.inline_data.data:
                            image = Image.open(io.BytesIO(part.inline_data.data))
                            buffer = io.BytesIO()
                            image.convert("RGB").save(buffer, format="JPEG", quality=85)
                            return buffer.getvalue()

            raise GeminiAPIError("No image in response")

        except GeminiAPIError:
            raise
        except Exception as e:
            logger.exception("Gemini API error")
            raise GeminiAPIError(str(e)) from e
