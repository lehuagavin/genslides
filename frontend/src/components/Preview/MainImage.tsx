/**
 * Main image display component - fills container
 */

import { cn } from "@/utils";
import type { SlideImage } from "@/types";

interface MainImageProps {
  image: SlideImage | null;
  isGenerating: boolean;
  hasMatchedImage?: boolean;
}

export function MainImage({ image, isGenerating, hasMatchedImage = false }: MainImageProps): JSX.Element {
  return (
    <div
      className={cn(
        "relative w-full max-h-full aspect-video overflow-hidden",
        "border-3 border-[var(--md-graphite)] bg-[var(--md-cloud)]",
        "shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
      )}
    >
      {image ? (
        <img
          src={image.url}
          alt="Current slide"
          className={cn(
            "w-full h-full object-cover",
            isGenerating && "opacity-50"
          )}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-[var(--md-slate)]">
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
            className="opacity-50"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-sm font-medium">
            Click "Generate" to create an image
          </span>
        </div>
      )}

      {/* Generating overlay */}
      {isGenerating && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--md-graphite)]/40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
          <span className="text-lg font-bold text-white">Generating...</span>
        </div>
      )}

      {/* Content changed indicator - only show if no image matches current content */}
      {image && !hasMatchedImage && !isGenerating && (
        <div className="absolute left-3 top-3 rounded border-2 border-[var(--md-graphite)] bg-[var(--md-sunbeam)] px-3 py-1.5 text-sm font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          Content changed - regenerate
        </div>
      )}
    </div>
  );
}
