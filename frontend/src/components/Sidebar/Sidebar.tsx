/**
 * Sidebar component
 */

import { SlideList } from "./SlideList";
import { Button } from "@/components/common";
import type { Slide } from "@/types";
import { cn } from "@/utils";

interface SidebarProps {
  slides: Slide[];
  selectedSid: string | null;
  onSelect: (sid: string) => void;
  onDelete: (sid: string) => void;
  onAddSlide: (afterSid?: string) => void;
  onContentChange: (sid: string, content: string) => void;
  onReorder?: (order: string[]) => void;
  isCollapsed?: boolean;
}

export function Sidebar({
  slides,
  selectedSid,
  onSelect,
  onDelete,
  onAddSlide,
  onContentChange,
  onReorder,
  isCollapsed = false,
}: SidebarProps): JSX.Element {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r-2 border-[var(--md-graphite)] bg-[var(--md-cream)]",
        "transition-all duration-300",
        isCollapsed ? "w-0 overflow-hidden" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[var(--md-graphite)] p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider">Slides</h2>
        <Button size="sm" onClick={() => onAddSlide(selectedSid || undefined)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </Button>
      </div>

      {/* Slide list */}
      <div className="flex-1 overflow-y-auto p-4">
        <SlideList
          slides={slides}
          selectedSid={selectedSid}
          onSelect={onSelect}
          onDelete={onDelete}
          onContentChange={onContentChange}
          onReorder={onReorder}
        />
      </div>
    </aside>
  );
}
