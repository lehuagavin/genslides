"""VolcEngine Ark API service for image generation."""

import asyncio
import base64
import io
import logging
from typing import TYPE_CHECKING, Any

from PIL import Image

from app.exceptions import GenerationFailedError

if TYPE_CHECKING:
    from volcenginesdkarkruntime import Ark

logger = logging.getLogger(__name__)

# VolcEngine Seedream model
IMAGE_MODEL = "doubao-seedream-4-5-251128"

# API timeout in seconds
API_TIMEOUT = 60


class VolcEngineService:
    """Service for interacting with VolcEngine Ark API."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    def _check_availability(self) -> None:
        """Check if the service is properly configured.

        Raises:
            RuntimeError: If API key is not configured
        """
        if not self.api_key:
            raise RuntimeError(
                "VolcEngine API key not configured. "
                "Please set ARK_API_KEY environment variable."
            )

    def _create_client(self) -> "Ark":
        """Create a new Ark client (thread-safe for use in executor)."""
        from volcenginesdkarkruntime import Ark

        return Ark(api_key=self.api_key)

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
        # Check if service is available before making API calls
        self._check_availability()

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
            raise GenerationFailedError("Failed to generate any style images")

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
            style_image: Reference style image bytes (not used for VolcEngine, style conveyed via prompt)
            style_prompt: Style description prompt

        Returns:
            Generated image bytes in JPEG format
        """
        # Check if service is available before making API calls
        self._check_availability()

        # Note: VolcEngine API's image parameter requires an HTTP/HTTPS URL,
        # which would need infrastructure setup for hosting the reference image.
        # For now, we rely on detailed prompt description to convey style.

        full_prompt = f"""
Generate a presentation slide image with the following content and style.

CONTENT:
{content}

STYLE REQUIREMENTS:
{style_prompt}

INSTRUCTIONS:
- Follow the style description exactly
- Include the content text in a readable, well-positioned manner
- Maintain 16:9 aspect ratio
- Keep the design clean and professional
- Ensure good contrast between text and background
- Match the visual aesthetics described in the style requirements
"""

        return await self._generate_single_image(full_prompt)

    async def _generate_single_image(self, prompt: str) -> bytes:
        """Generate a single image from prompt."""
        try:

            def _call_api() -> Any:
                """Call Ark API in executor (each call gets fresh client)."""
                client = self._create_client()
                response = client.images.generate(
                    model=IMAGE_MODEL,
                    prompt=prompt,
                    size="2560x1440",  # 16:9 aspect ratio, min 3686400 pixels required
                    response_format="b64_json",  # Request base64 encoded response
                    watermark=False,  # Disable watermark
                )

                # Extract image from response
                if response.data and len(response.data) > 0:
                    image_data = response.data[0].b64_json
                    if image_data:
                        return base64.b64decode(image_data)
                    # Fallback to URL if b64_json is not available
                    elif response.data[0].url:
                        import httpx
                        url_response = httpx.get(response.data[0].url, timeout=API_TIMEOUT)
                        url_response.raise_for_status()
                        return url_response.content

                raise GenerationFailedError("No image in response")

            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            image_bytes = await loop.run_in_executor(None, _call_api)

            # Convert to JPEG format
            image = Image.open(io.BytesIO(image_bytes))
            buffer = io.BytesIO()
            image.convert("RGB").save(buffer, format="JPEG", quality=85)
            return buffer.getvalue()

        except GenerationFailedError:
            raise
        except Exception as e:
            logger.exception("VolcEngine API error")
            raise GenerationFailedError(f"Image generation failed: {str(e)}") from e

    async def _generate_image_with_reference(
        self, prompt: str, reference_image: str
    ) -> bytes:
        """Generate an image with a reference style image.

        Args:
            prompt: Text prompt for generation
            reference_image: Data URL or HTTP URL of reference image

        Returns:
            Generated image bytes in JPEG format
        """
        try:

            def _call_api() -> Any:
                """Call Ark API with reference image in executor."""
                client = self._create_client()
                response = client.images.generate(
                    model=IMAGE_MODEL,
                    prompt=prompt,
                    image=reference_image,  # Data URL or HTTP URL
                    size="2560x1440",  # 16:9 aspect ratio, min 3686400 pixels required
                    response_format="b64_json",  # Request base64 encoded response
                    watermark=False,  # Disable watermark
                )

                # Extract image from response
                if response.data and len(response.data) > 0:
                    image_data = response.data[0].b64_json
                    if image_data:
                        return base64.b64decode(image_data)
                    # Fallback to URL if b64_json is not available
                    elif response.data[0].url:
                        import httpx
                        url_response = httpx.get(response.data[0].url, timeout=API_TIMEOUT)
                        url_response.raise_for_status()
                        return url_response.content

                raise GenerationFailedError("No image in response")

            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            image_bytes = await loop.run_in_executor(None, _call_api)

            # Convert to JPEG format
            image = Image.open(io.BytesIO(image_bytes))
            buffer = io.BytesIO()
            image.convert("RGB").save(buffer, format="JPEG", quality=85)
            return buffer.getvalue()

        except GenerationFailedError:
            raise
        except Exception as e:
            logger.exception("VolcEngine API error")
            raise GenerationFailedError(f"Image generation failed: {str(e)}") from e
