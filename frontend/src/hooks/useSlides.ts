/**
 * Hook for slides data fetching and management
 */

import { useEffect, useCallback, useRef } from "react";
import { slidesApi } from "@/api";
import { useSlidesStore, useUIStore } from "@/stores";
import { useStyleStore } from "@/stores";
import { logger } from "@/utils";

export function useSlides(slug: string, initialTitle?: string | null) {
  const {
    slides,
    title,
    selectedSid,
    isLoading,
    error,
    cost,
    setSlug,
    setTitle,
    setSlides,
    selectSlide,
    setCost,
    setLoading,
    setError,
  } = useSlidesStore();

  const { setStyle, openSetupModal } = useStyleStore();
  const { addToast } = useUIStore();

  // Use ref to track initialTitle without adding to effect dependencies
  const initialTitleRef = useRef(initialTitle);
  initialTitleRef.current = initialTitle;
  const titleAppliedRef = useRef(false);

  // Fetch project on mount
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);

      try {
        const project = await slidesApi.getProject(slug);
        setSlug(slug);

        // Check if we should apply initial title
        const pendingTitle = initialTitleRef.current;
        if (pendingTitle && project.title === "Untitled" && !titleAppliedRef.current) {
          titleAppliedRef.current = true;
          // Update title on server
          try {
            await slidesApi.updateTitle(slug, pendingTitle);
            setTitle(pendingTitle);
          } catch (err) {
            logger.error("Failed to apply initial title:", err);
            setTitle(project.title);
          }
        } else {
          setTitle(project.title);
        }

        setSlides(project.slides);
        setCost(project.cost);
        setStyle(project.style);

        // Open style setup if no style is set
        if (!project.style) {
          openSetupModal();
        }

        logger.info("Project loaded:", project.slug);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load project";
        setError(message);
        addToast({ type: "error", message });
        logger.error("Failed to load project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [
    slug,
    setSlug,
    setTitle,
    setSlides,
    setCost,
    setStyle,
    setLoading,
    setError,
    openSetupModal,
    addToast,
  ]);

  // Update title
  const updateTitle = useCallback(
    async (newTitle: string) => {
      try {
        await slidesApi.updateTitle(slug, newTitle);
        setTitle(newTitle);
      } catch (err) {
        addToast({
          type: "error",
          message: "Failed to update title",
        });
        logger.error("Failed to update title:", err);
      }
    },
    [slug, setTitle, addToast]
  );

  // Create slide
  const createSlide = useCallback(
    async (content: string, afterSid?: string) => {
      try {
        const slide = await slidesApi.createSlide(slug, { content, after_sid: afterSid });
        useSlidesStore.getState().addSlide(slide, afterSid);
        return slide;
      } catch (err) {
        addToast({
          type: "error",
          message: "Failed to create slide",
        });
        logger.error("Failed to create slide:", err);
        throw err;
      }
    },
    [slug, addToast]
  );

  // Update slide content
  const updateSlideContent = useCallback(
    async (sid: string, content: string) => {
      // Warn if content is empty but allow it
      if (typeof content !== "string") {
        logger.error("Invalid content type:", typeof content);
        return;
      }

      logger.info("Updating slide content:", { sid, contentLength: content.length });

      try {
        await slidesApi.updateSlide(slug, sid, content);
        useSlidesStore.getState().updateSlide(sid, content);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update slide";
        addToast({
          type: "error",
          message,
        });
        logger.error("Failed to update slide:", err);
      }
    },
    [slug, addToast]
  );

  // Delete slide
  const deleteSlide = useCallback(
    async (sid: string) => {
      try {
        await slidesApi.deleteSlide(slug, sid);
        useSlidesStore.getState().deleteSlide(sid);
      } catch (err) {
        addToast({
          type: "error",
          message: "Failed to delete slide",
        });
        logger.error("Failed to delete slide:", err);
      }
    },
    [slug, addToast]
  );

  // Reorder slides
  const reorderSlides = useCallback(
    async (order: string[]) => {
      try {
        await slidesApi.reorderSlides(slug, order);
        useSlidesStore.getState().reorderSlides(order);
      } catch (err) {
        addToast({
          type: "error",
          message: "Failed to reorder slides",
        });
        logger.error("Failed to reorder slides:", err);
      }
    },
    [slug, addToast]
  );

  return {
    slides,
    title,
    selectedSid,
    isLoading,
    error,
    cost,
    selectSlide,
    updateTitle,
    createSlide,
    updateSlideContent,
    deleteSlide,
    reorderSlides,
  };
}
