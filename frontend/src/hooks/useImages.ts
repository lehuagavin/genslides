/**
 * Hook for image management
 */

import { useCallback } from "react";
import { imagesApi } from "@/api";
import { useUIStore, useSlidesStore } from "@/stores";
import { logger } from "@/utils";

export function useImages(slug: string) {
  const { addToast, addGeneratingSlide, removeGeneratingSlide, isSlideGenerating } =
    useUIStore();
  const { deleteSlideImage } = useSlidesStore();

  // Generate image for a slide
  const generateImage = useCallback(
    async (sid: string, force = false) => {
      if (isSlideGenerating(sid)) {
        logger.warn("Slide is already generating:", sid);
        return;
      }

      addGeneratingSlide(sid);

      try {
        const response = await imagesApi.generateImage(slug, sid, force);
        logger.info("Generation task started:", response.task_id);
        // The actual image will be updated via WebSocket
      } catch (err) {
        removeGeneratingSlide(sid);
        addToast({
          type: "error",
          message: "Failed to start image generation",
        });
        logger.error("Failed to generate image:", err);
      }
    },
    [slug, addToast, addGeneratingSlide, removeGeneratingSlide, isSlideGenerating]
  );

  // Get images for a slide
  const getImages = useCallback(
    async (sid: string) => {
      try {
        return await imagesApi.getImages(slug, sid);
      } catch (err) {
        logger.error("Failed to get images:", err);
        return null;
      }
    },
    [slug]
  );

  // Delete an image from a slide
  const deleteImage = useCallback(
    async (sid: string, imageHash: string) => {
      try {
        await imagesApi.deleteImage(slug, sid, imageHash);
        deleteSlideImage(sid, imageHash);
        addToast({
          type: "success",
          message: "Image deleted",
        });
      } catch (err) {
        addToast({
          type: "error",
          message: "Failed to delete image",
        });
        logger.error("Failed to delete image:", err);
      }
    },
    [slug, deleteSlideImage, addToast]
  );

  return {
    generateImage,
    getImages,
    deleteImage,
    isSlideGenerating,
  };
}
