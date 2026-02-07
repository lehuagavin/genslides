"""Nano Banana API service for image generation.

Uses Google GenAI SDK with custom base URL and API key
to generate images via the Nano Banana platform.
"""

import asyncio
import io
import logging
import re
from typing import TYPE_CHECKING, Any

from PIL import Image

from app.exceptions import NanoBananaAPIError

if TYPE_CHECKING:
    from google import genai

logger = logging.getLogger(__name__)

# API timeout in seconds
API_TIMEOUT = 300


class NanoBananaService:
    """Service for interacting with Nano Banana image generation API."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.mmw.ink",
        model: str = "[A]gemini-3-pro-image-preview",
        image_size: str = "2K",
    ):
        self.api_key = api_key
        self.base_url = base_url.strip().rstrip("/") if base_url else "https://api.mmw.ink"
        self.model = model
        self.image_size = image_size.strip().upper() if image_size else "2K"

    def _check_availability(self) -> None:
        """Check if the service is properly configured.

        Raises:
            RuntimeError: If API key is not configured
        """
        if not self.api_key:
            raise RuntimeError(
                "Nano Banana API key not configured. "
                "Please set NANO_API_KEY environment variable."
            )

    def _create_client(self, *, bearer: bool = False) -> "genai.Client":
        """Create a new GenAI client.

        Args:
            bearer: If True, use Bearer token authentication instead of api_key.

        Returns:
            A configured genai.Client instance.
        """
        from google import genai
        from google.genai import types

        if bearer:
            return genai.Client(
                vertexai=True,
                http_options=types.HttpOptions(
                    base_url=self.base_url,
                    timeout=API_TIMEOUT * 1000,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                ),
            )
        return genai.Client(
            api_key=self.api_key,
            http_options=types.HttpOptions(
                base_url=self.base_url,
                timeout=API_TIMEOUT * 1000,
            ),
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
            raise NanoBananaAPIError("Failed to generate any style images")

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
        self._check_availability()

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
                """Call API in executor with fallback authentication."""
                contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
                config = types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"],
                    image_config=types.ImageConfig(image_size=self.image_size),
                )

                # Try api_key auth first, then fallback to bearer
                try:
                    client = self._create_client(bearer=False)
                    return client.models.generate_content(
                        model=self.model, contents=contents, config=config
                    )
                except Exception as e:
                    logger.warning("API key auth failed, trying Bearer: %s", e)
                    client = self._create_client(bearer=True)
                    return client.models.generate_content(
                        model=self.model, contents=contents, config=config
                    )

            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, _call_api)

            # Extract image from response
            image_bytes = self._extract_image_from_response(response)
            if image_bytes is None:
                raise NanoBananaAPIError("No image in response")

            # Convert to JPEG format
            image = Image.open(io.BytesIO(image_bytes))
            buffer = io.BytesIO()
            image.convert("RGB").save(buffer, format="JPEG", quality=85)
            return buffer.getvalue()

        except NanoBananaAPIError:
            raise
        except Exception as e:
            logger.exception("Nano Banana API error")
            raise NanoBananaAPIError(str(e)) from e

    async def _generate_image_with_reference(
        self, prompt: str, reference: Image.Image
    ) -> bytes:
        """Generate an image with a reference style image."""
        try:
            from google.genai import types

            def _call_api() -> Any:
                """Call API in executor with fallback authentication."""
                config = types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"],
                    image_config=types.ImageConfig(image_size=self.image_size),
                )

                # Try api_key auth first, then fallback to bearer
                try:
                    client = self._create_client(bearer=False)
                    return client.models.generate_content(
                        model=self.model,
                        contents=[prompt, reference],  # type: ignore[arg-type]
                        config=config,
                    )
                except Exception as e:
                    logger.warning("API key auth failed, trying Bearer: %s", e)
                    client = self._create_client(bearer=True)
                    return client.models.generate_content(
                        model=self.model,
                        contents=[prompt, reference],  # type: ignore[arg-type]
                        config=config,
                    )

            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, _call_api)

            # Extract image from response
            image_bytes = self._extract_image_from_response(response)
            if image_bytes is None:
                raise NanoBananaAPIError("No image in response")

            # Convert to JPEG format
            image = Image.open(io.BytesIO(image_bytes))
            buffer = io.BytesIO()
            image.convert("RGB").save(buffer, format="JPEG", quality=85)
            return buffer.getvalue()

        except NanoBananaAPIError:
            raise
        except Exception as e:
            logger.exception("Nano Banana API error")
            raise NanoBananaAPIError(str(e)) from e

    @staticmethod
    def _extract_image_from_response(response: Any) -> bytes | None:
        """Extract image bytes from GenAI response.

        Also handles fallback to downloading from URLs found in text parts.

        Args:
            response: The GenAI API response object

        Returns:
            Image bytes or None if no image found
        """
        image_bytes = None
        texts: list[str] = []

        candidates = getattr(response, "candidates", None) or []
        for cand in candidates:
            content = getattr(cand, "content", None)
            if content is None:
                continue
            parts = getattr(content, "parts", None) or []
            for part in parts:
                inline = getattr(part, "inline_data", None)
                if inline is not None:
                    data = getattr(inline, "data", None)
                    if data and image_bytes is None:
                        image_bytes = data
                text = getattr(part, "text", None)
                if isinstance(text, str) and text.strip():
                    texts.append(text)

        if image_bytes is not None:
            return image_bytes

        # Fallback: try downloading from URLs in text response
        urls = re.findall(r"https?://[^\s)]+", "\n".join(texts))
        urls = list(dict.fromkeys([u.strip() for u in urls if u.strip()]))
        if not urls:
            return None

        logger.info("Trying to download image from URL in response")
        import httpx

        timeout = httpx.Timeout(connect=10.0, read=60.0, write=60.0, pool=10.0)
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            for url in urls[:6]:
                try:
                    resp = client.get(url)
                    if resp.status_code == 200 and resp.content:
                        return bytes(resp.content)
                except Exception as e:
                    logger.warning("Failed to download image from %s: %s", url, e)

        return None
