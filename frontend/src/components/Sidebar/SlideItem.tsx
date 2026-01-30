/**
 * Slide list item component - with thumbnail and popup edit
 */

import { useState, useMemo } from "react";
import { cn } from "@/utils";
import { SlideEditModal } from "./SlideEditModal";
import { useSlidesStore } from "@/stores";
import type { Slide, SlideImage } from "@/types";

interface SlideItemProps {
  slide: Slide;
  index: number;
  isSelected: boolean;
  isGenerating: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onSelect: (sid: string) => void;
  onDelete: (sid: string) => void;
  onContentChange: (sid: string, content: string) => void;
  onDragStart?: (e: React.DragEvent, sid: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent, sid: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, sid: string) => void;
}

export function SlideItem({
  slide,
  index,
  isSelected,
  isGenerating,
  isDragging = false,
  isDragOver = false,
  onSelect,
  onDelete,
  onContentChange,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: SlideItemProps): JSX.Element {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { displayedImageHash } = useSlidesStore();

  // Get the currently displayed image for this slide
  const displayedImage: SlideImage | null = useMemo(() => {
    const hash = displayedImageHash[slide.sid];
    if (hash && slide.images) {
      const found = slide.images.find((img) => img.hash === hash);
      if (found) return found;
    }
    // Fallback to current_image
    return slide.current_image;
  }, [slide.sid, slide.images, slide.current_image, displayedImageHash]);

  const handleDoubleClick = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = (content: string) => {
    if (content !== slide.content) {
      onContentChange(slide.sid, content);
    }
  };

  // Check if any image matches the current content
  const hasMatchedImage = slide.images?.some((img) => img.matched) || slide.current_image?.matched;

  return (
    <>
      <div
        className={cn(
          "group relative cursor-pointer border-2 border-[var(--md-graphite)] p-1.5 transition-all",
          "hover:translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_0_rgba(0,0,0,1)]",
          isSelected
            ? "bg-[var(--md-sunbeam)]"
            : "bg-[var(--md-cloud)] hover:bg-[var(--md-fog)]",
          isDragging && "opacity-50 scale-95",
          isDragOver && "ring-2 ring-[var(--md-sky-strong)] ring-offset-2"
        )}
        onClick={() => onSelect(slide.sid)}
        onDoubleClick={handleDoubleClick}
        draggable
        onDragStart={(e) => onDragStart?.(e, slide.sid)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onDragOver?.(e, slide.sid)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop?.(e, slide.sid)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSelect(slide.sid);
        }}
      >
        {/* Top right: indicators + delete button */}
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
          {/* Generating indicator */}
          {isGenerating && (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--md-ink)] border-t-transparent" />
          )}
          {/* Content changed indicator - show if no image matches current content */}
          {displayedImage && !hasMatchedImage && (
            <span className="rounded bg-[var(--md-watermelon)] px-1 py-0.5 text-[10px] font-bold text-white">
              !
            </span>
          )}
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(slide.sid);
            }}
            className="opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Delete slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--md-slate)] hover:text-[var(--md-watermelon)]"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Thumbnail - shows currently displayed image */}
        <div className="relative mb-0.5 aspect-video w-full overflow-hidden border border-[var(--md-graphite)] bg-[var(--md-fog)]">
          {displayedImage ? (
            <img
              src={displayedImage.thumbnail_url || displayedImage.url}
              alt={`Slide ${index + 1}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--md-slate)]"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}

          {/* Generating overlay */}
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>

        {/* Content preview with page number */}
        <div className="flex items-center justify-between gap-2 leading-tight">
          <p
            className={cn(
              "text-xs truncate flex-1 leading-tight",
              isSelected ? "text-[var(--md-ink)]" : "text-[var(--md-slate)]",
              !slide.content && "italic"
            )}
          >
            {slide.content || "Double-click to edit..."}
          </p>
          <span className="text-xs font-bold text-[var(--md-slate)] flex-shrink-0 leading-tight">
            {index + 1}
          </span>
        </div>
      </div>

      {/* Edit Modal */}
      <SlideEditModal
        isOpen={isEditModalOpen}
        slideIndex={index}
        content={slide.content}
        onSave={handleSave}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
