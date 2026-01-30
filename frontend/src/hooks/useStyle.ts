/**
 * Hook for style management
 */

import { useCallback } from "react";
import { styleApi } from "@/api";
import { useStyleStore, useUIStore, useSlidesStore } from "@/stores";
import { logger } from "@/utils";

export function useStyle(slug: string) {
  const {
    style,
    candidates,
    isGenerating,
    showSetupModal,
    showSettingsModal,
    promptInput,
    setStyle,
    setCandidates,
    setGenerating,
    setPromptInput,
    openSetupModal,
    closeSetupModal,
    openSettingsModal,
    closeSettingsModal,
    clearCandidates,
  } = useStyleStore();

  const { addToast } = useUIStore();

  // Generate candidate styles
  const generateCandidates = useCallback(
    async (prompt: string) => {
      setGenerating(true);
      clearCandidates();
      setPromptInput(prompt); // Save prompt for later use in saveStyle

      try {
        const response = await styleApi.generateStyle(slug, prompt);
        setCandidates(response.candidates);
        logger.info("Style candidates generated:", response.candidates.length);
      } catch (err) {
        addToast({
          type: "error",
          message: "Failed to generate style candidates",
        });
        logger.error("Failed to generate style:", err);
      } finally {
        setGenerating(false);
      }
    },
    [slug, setGenerating, clearCandidates, setPromptInput, setCandidates, addToast]
  );

  // Save selected style
  const saveStyle = useCallback(
    async (candidateId: string) => {
      // Get latest promptInput from store to avoid stale closure
      const currentPrompt = useStyleStore.getState().promptInput;
      logger.info("Saving style with:", { slug, promptInput: currentPrompt, candidateId });
      try {
        const response = await styleApi.saveStyle(slug, currentPrompt, candidateId);
        setStyle(response.style);
        closeSetupModal();
        closeSettingsModal();
        addToast({
          type: "success",
          message: "Style saved successfully",
        });
        logger.info("Style saved:", response.style);
      } catch (err) {
        addToast({
          type: "error",
          message: "Failed to save style",
        });
        logger.error("Failed to save style:", err);
      }
    },
    [slug, setStyle, closeSetupModal, closeSettingsModal, addToast]
  );

  // Get style image URL
  const getStyleImageUrl = useCallback(() => {
    if (!style) return null;
    return `/static/slides/${slug}/${style.image}`;
  }, [slug, style]);

  return {
    style,
    candidates,
    isGenerating,
    showSetupModal,
    showSettingsModal,
    promptInput,
    setPromptInput,
    openSetupModal,
    closeSetupModal,
    openSettingsModal,
    closeSettingsModal,
    generateCandidates,
    saveStyle,
    getStyleImageUrl,
  };
}
