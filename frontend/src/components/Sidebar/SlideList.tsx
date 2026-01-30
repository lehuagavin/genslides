/**
 * Slide list component with drag-and-drop reorder support
 */

import { useState, useCallback } from "react";
import { SlideItem } from "./SlideItem";
import type { Slide } from "@/types";
import { useUIStore } from "@/stores";

interface SlideListProps {
  slides: Slide[];
  selectedSid: string | null;
  onSelect: (sid: string) => void;
  onDelete: (sid: string) => void;
  onContentChange: (sid: string, content: string) => void;
  onReorder?: (order: string[]) => void;
}

export function SlideList({
  slides,
  selectedSid,
  onSelect,
  onDelete,
  onContentChange,
  onReorder,
}: SlideListProps): JSX.Element {
  const { isSlideGenerating } = useUIStore();
  const [draggingSid, setDraggingSid] = useState<string | null>(null);
  const [dragOverSid, setDragOverSid] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, sid: string) => {
    setDraggingSid(sid);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", sid);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingSid(null);
    setDragOverSid(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, sid: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSid(sid);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverSid(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetSid: string) => {
      e.preventDefault();
      const sourceSid = e.dataTransfer.getData("text/plain");

      if (sourceSid && sourceSid !== targetSid && onReorder) {
        const sourceIndex = slides.findIndex((s) => s.sid === sourceSid);
        const targetIndex = slides.findIndex((s) => s.sid === targetSid);

        if (sourceIndex !== -1 && targetIndex !== -1) {
          const newOrder = slides.map((s) => s.sid);
          newOrder.splice(sourceIndex, 1);
          newOrder.splice(targetIndex, 0, sourceSid);
          onReorder(newOrder);
        }
      }

      setDraggingSid(null);
      setDragOverSid(null);
    },
    [slides, onReorder]
  );

  if (slides.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-[var(--md-slate)]">
        No slides yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {slides.map((slide, index) => (
        <SlideItem
          key={slide.sid}
          slide={slide}
          index={index}
          isSelected={slide.sid === selectedSid}
          isGenerating={isSlideGenerating(slide.sid)}
          isDragging={slide.sid === draggingSid}
          isDragOver={slide.sid === dragOverSid && slide.sid !== draggingSid}
          onSelect={onSelect}
          onDelete={onDelete}
          onContentChange={onContentChange}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
