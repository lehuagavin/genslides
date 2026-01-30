/**
 * Floating thumbnail list with generate button
 */

import { cn } from "@/utils";
import type { SlideImage } from "@/types";

interface ThumbnailListProps {
  images: SlideImage[];
  currentHash: string | null;
  onSelect: (hash: string) => void;
  onDelete?: (hash: string) => void;
  needsGeneration?: boolean;
  isGenerating?: boolean;
  onGenerate?: () => void;
  disabled?: boolean;
}

export function ThumbnailList({
  images,
  currentHash,
  onSelect,
  onDelete,
  needsGeneration = false,
  isGenerating = false,
  onGenerate,
  disabled = false,
}: ThumbnailListProps): JSX.Element {
  // Always show the container for consistent layout
  const showGenerateButton = needsGeneration || isGenerating || images.length === 0;

  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-[var(--md-graphite)] bg-[var(--md-cloud)] p-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      {/* Existing image thumbnails */}
      {images.map((image, index) => (
        <div key={image.hash} className="group relative">
          <button
            onClick={() => onSelect(image.hash)}
            className={cn(
              "relative h-12 w-20 flex-shrink-0 overflow-hidden border-2 transition-all",
              "hover:border-[var(--md-sky)] hover:scale-105",
              currentHash === image.hash
                ? "border-[var(--md-sky-strong)] ring-2 ring-[var(--md-sky)]"
                : "border-[var(--md-graphite)]"
            )}
            title={`Image ${index + 1}${image.matched ? " (matches current text)" : " (outdated)"}`}
          >
            <img
              src={image.thumbnail_url || image.url}
              alt={`Version ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
          {/* Delete button - shown on hover */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image.hash);
              }}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--md-watermelon)] text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
              title="Delete image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      ))}

      {/* Generate button - shown when content doesn't match any image */}
      {showGenerateButton && (
        <button
          onClick={onGenerate}
          disabled={disabled || isGenerating}
          className={cn(
            "flex h-12 w-20 flex-shrink-0 items-center justify-center border-2 border-dashed transition-all",
            "border-[var(--md-graphite)]",
            disabled
              ? "cursor-not-allowed bg-[var(--md-fog)] opacity-50"
              : "cursor-pointer bg-[var(--md-sunbeam)] hover:bg-[var(--md-sunbeam-dark)] hover:scale-105"
          )}
          title={disabled ? "Set a style first" : "Generate image for current text"}
        >
          {isGenerating ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--md-ink)] border-t-transparent" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--md-ink)]"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
