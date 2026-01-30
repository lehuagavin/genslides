/**
 * Preview component - main image display with floating thumbnail list
 */

import { useMemo, useCallback } from "react";
import { MainImage } from "./MainImage";
import { ThumbnailList } from "./ThumbnailList";
import { useSlidesStore, useSelectedSlide, useStyleStore, useUIStore } from "@/stores";
import type { SlideImage } from "@/types";

interface PreviewProps {
  onGenerate: (sid: string) => void;
  onDeleteImage: (sid: string, imageHash: string) => void;
}

export function Preview({ onGenerate, onDeleteImage }: PreviewProps): JSX.Element {
  const slide = useSelectedSlide();
  const { style } = useStyleStore();
  const { isSlideGenerating } = useUIStore();
  const { displayedImageHash, setDisplayedImage } = useSlidesStore();

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

  // Get the currently displayed image
  const displayedImage = useMemo(() => {
    if (!slide) return null;
    const hash = displayedImageHash[slide.sid];
    if (hash) {
      const found = images.find((img) => img.hash === hash);
      if (found) return found;
    }
    // Fallback to current_image or last image
    return slide.current_image || images[images.length - 1] || null;
  }, [slide, displayedImageHash, images]);

  // Handle image selection
  const handleSelectImage = useCallback(
    (hash: string) => {
      if (slide) {
        setDisplayedImage(slide.sid, hash);
      }
    },
    [slide, setDisplayedImage]
  );

  // Check if content matches any image
  const hasMatchedImage = images.some((img) => img.matched);
  const needsGeneration = slide && slide.content.trim() && !hasMatchedImage;

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
    <div className="flex h-full flex-col bg-[var(--md-cream)]">
      {/* Main image area with floating thumbnails */}
      <div className="relative flex-1 flex items-center justify-center p-2">
        <MainImage image={displayedImage} isGenerating={isGenerating} hasMatchedImage={hasMatchedImage} />

        {/* Floating thumbnail list at bottom center */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <ThumbnailList
            images={images}
            currentHash={displayedImage?.hash || null}
            onSelect={handleSelectImage}
            onDelete={handleDeleteImage}
            needsGeneration={needsGeneration && !isGenerating}
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
