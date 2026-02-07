/**
 * Engine selector component for switching between image generation engines.
 * Engine state is loaded with the project data in useSlides hook,
 * this component only handles switching.
 */

import { useSlidesStore } from "@/stores/slidesStore";
import { imagesApi } from "@/api/images";
import { useState, useCallback } from "react";

const ENGINE_OPTIONS = [
  { value: "gemini" as const, label: "Gemini 3 Pro" },
  { value: "volcengine" as const, label: "Seedream 4.5" },
];

export function EngineSelector(): JSX.Element {
  const slug = useSlidesStore((state) => state.slug);
  const imageEngine = useSlidesStore((state) => state.imageEngine);
  const setImageEngine = useSlidesStore((state) => state.setImageEngine);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleEngineChange = useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (!slug || isSwitching) return;

      const newEngine = event.target.value as "gemini" | "volcengine";
      if (newEngine === imageEngine) return;

      // Optimistic update: update UI immediately
      const previousEngine = imageEngine;
      setImageEngine(newEngine);
      setIsSwitching(true);

      try {
        await imagesApi.updateEngine(slug, newEngine);
      } catch (error) {
        // Revert on failure
        setImageEngine(previousEngine);
        console.error("Failed to update image engine:", error);
      } finally {
        setIsSwitching(false);
      }
    },
    [slug, imageEngine, isSwitching, setImageEngine]
  );

  const currentLabel =
    ENGINE_OPTIONS.find((opt) => opt.value === imageEngine)?.label ?? imageEngine;

  return (
    <div className="flex items-center gap-2" title={`当前绘图引擎：${currentLabel}`}>
      <label className="text-xs font-medium text-[var(--md-slate)] normal-case">
        绘图引擎
      </label>
      <select
        value={imageEngine}
        onChange={handleEngineChange}
        disabled={isSwitching}
        className="px-2 py-1 border-2 border-[var(--md-graphite)] rounded text-xs normal-case bg-[var(--md-cloud)] text-[var(--md-ink)] font-medium cursor-pointer hover:bg-[var(--md-fog)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sky-strong)] disabled:opacity-50 disabled:cursor-wait transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
      >
        {ENGINE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
