/**
 * Preview component - main image display with floating thumbnail list
 */

import { useMemo, useCallback, useRef, useState, useEffect } from "react";
import { MainImage } from "./MainImage";
import { ThumbnailList } from "./ThumbnailList";
import { useSlidesStore, useSelectedSlide, useStyleStore, useUIStore } from "@/stores";
import { imagesApi } from "@/api";
import { logger } from "@/utils";
import type { SlideImage } from "@/types";

interface PreviewProps {
  onGenerate: (sid: string) => void;
  onDeleteImage: (sid: string, imageHash: string) => void;
}

export function Preview({ onGenerate, onDeleteImage }: PreviewProps): JSX.Element {
  const slide = useSelectedSlide();
  const { style } = useStyleStore();
  const { isSlideGenerating } = useUIStore();
  const { slug, setSelectedImageHash } = useSlidesStore();

  const handleGenerate = useCallback(() => {
    if (slide) {
      onGenerate(slide.sid);
    }
  }, [slide, onGenerate]);

  const handleDeleteImage = useCallback(
    (hash: string) => {
      if (slide) {
        onDeleteImage(slide.sid, hash);
      }
    },
    [slide, onDeleteImage]
  );

  const isGenerating = slide ? isSlideGenerating(slide.sid) : false;

  // Build images list from images array
  const images: SlideImage[] = useMemo(() => {
    if (!slide) return [];
    if (slide.images && slide.images.length > 0) {
      return slide.images;
    }
    if (slide.current_image) {
      return [slide.current_image];
    }
    return [];
  }, [slide]);

  // Get the currently displayed image based on selected_image_hash from backend
  const displayedImage = useMemo(() => {
    if (!slide) return null;
    if (slide.selected_image_hash) {
      const found = images.find((img) => img.hash === slide.selected_image_hash);
      if (found) return found;
    }
    // Fallback to current_image or last image
    return slide.current_image || images[images.length - 1] || null;
  }, [slide, images]);

  // Handle image selection - update locally and persist to backend
  const handleSelectImage = useCallback(
    (hash: string) => {
      if (slide && slug) {
        setSelectedImageHash(slide.sid, hash);
        // Persist to backend (fire-and-forget)
        imagesApi.selectImage(slug, slide.sid, hash).catch((err) => {
          logger.error("Failed to persist image selection:", err);
        });
      }
    },
    [slide, slug, setSelectedImageHash]
  );

  // Check if content matches any image
  const hasMatchedImage = images.some((img) => img.matched);
  const needsGeneration = slide && slide.content.trim() && !hasMatchedImage;

  // Calculate optimal 16:9 image dimensions to fit within container
  const imageAreaRef = useRef<HTMLDivElement>(null);
  const [imageDims, setImageDims] = useState<{ w: number; h: number } | null>(null);
  const hasSlide = !!slide;

  useEffect(() => {
    const el = imageAreaRef.current;
    if (!el) {
      setImageDims(null);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width <= 0 || height <= 0) return;

      const ASPECT = 16 / 9;
      const SHADOW = 6; // reserve space for box-shadow offset
      const maxW = width - SHADOW;
      const maxH = height - SHADOW;

      let w = maxW;
      let h = w / ASPECT;
      if (h > maxH) {
        h = maxH;
        w = h * ASPECT;
      }

      setImageDims({ w: Math.round(w), h: Math.round(h) });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasSlide]);

  if (!slide) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[var(--md-cream)]">
        <div className="text-center text-[var(--md-slate)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <p className="text-lg">Select a slide to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--md-cream)] overflow-auto">
      {/* Main image area with thumbnails anchored below */}
      <div className="relative flex-1 flex flex-col px-4 py-1 min-h-0">
        {/* Image area - measured by ResizeObserver for aspect-ratio fitting */}
        <div ref={imageAreaRef} className="flex-1 min-h-0 w-full flex items-center justify-center">
          <div
            style={imageDims ? { width: imageDims.w, height: imageDims.h } : undefined}
            className={!imageDims ? "w-full aspect-video" : undefined}
          >
            <MainImage image={displayedImage} isGenerating={isGenerating} hasMatchedImage={hasMatchedImage} />
          </div>
        </div>

        {/* Thumbnail list anchored directly below image border */}
        <div className="flex-shrink-0 flex justify-center mt-2">
          <ThumbnailList
            images={images}
            currentHash={displayedImage?.hash || null}
            onSelect={handleSelectImage}
            onDelete={handleDeleteImage}
            needsGeneration={!!(needsGeneration && !isGenerating)}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            disabled={!style}
          />
        </div>

        {/* Style not set warning */}
        {!style && (
          <div className="absolute top-4 left-4">
            <span className="rounded border-2 border-[var(--md-graphite)] bg-[var(--md-watermelon)] px-3 py-1.5 text-sm font-bold text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              Set a style before generating
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
