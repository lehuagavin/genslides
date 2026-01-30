/**
 * Hook for WebSocket connection management
 */

import { useEffect, useRef, useCallback } from "react";
import { WebSocketClient } from "@/api";
import { useSlidesStore, useUIStore } from "@/stores";
import type { WSMessage, GenerationCompletedData, CostUpdatedData } from "@/types";
import { logger } from "@/utils";

export function useWebSocket(slug: string) {
  const clientRef = useRef<WebSocketClient | null>(null);
  const { updateSlideImage, setCost } = useSlidesStore();
  const { addToast, removeGeneratingSlide, setGeneratingSlides } = useUIStore();

  // Handle incoming messages
  const handleMessage = useCallback(
    (message: WSMessage) => {
      switch (message.type) {
        case "sync_generating_tasks": {
          const data = message.data as { sids: string[] };
          setGeneratingSlides(data.sids);
          logger.debug("Synced generating tasks:", data.sids);
          break;
        }

        case "generation_completed": {
          const data = message.data as GenerationCompletedData;
          updateSlideImage(data.sid, {
            hash: data.image.hash,
            url: data.image.url,
            thumbnail_url: data.image.thumbnail_url,
            created_at: new Date().toISOString(),
            matched: true,
          });
          removeGeneratingSlide(data.sid);
          addToast({
            type: "success",
            message: "Image generated successfully",
          });
          break;
        }

        case "generation_failed": {
          const data = message.data as { sid: string; error: string };
          removeGeneratingSlide(data.sid);
          addToast({
            type: "error",
            message: `Generation failed: ${data.error}`,
          });
          break;
        }

        case "cost_updated": {
          const data = message.data as CostUpdatedData;
          const currentCost = useSlidesStore.getState().cost;
          if (currentCost) {
            setCost({
              ...currentCost,
              total_images: data.total_images,
              estimated_cost: data.estimated_cost,
            });
          }
          break;
        }

        case "generation_started": {
          logger.debug("Generation started:", message.data);
          break;
        }

        case "style_generation_completed": {
          logger.debug("Style generation completed:", message.data);
          break;
        }
      }
    },
    [updateSlideImage, removeGeneratingSlide, setGeneratingSlides, setCost, addToast]
  );

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    const client = new WebSocketClient(slug);
    clientRef.current = client;

    client.addHandler(handleMessage);
    client.connect();

    return () => {
      client.disconnect();
    };
  }, [slug, handleMessage]);

  return clientRef;
}
