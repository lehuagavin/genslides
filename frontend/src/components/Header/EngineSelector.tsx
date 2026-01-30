/**
 * Engine selector component for switching between image generation engines
 */

import { useSlidesStore } from "@/stores/slidesStore";
import { imagesApi } from "@/api/images";
import { useEffect } from "react";

export function EngineSelector(): JSX.Element {
  const slug = useSlidesStore((state) => state.slug);
  const imageEngine = useSlidesStore((state) => state.imageEngine);
  const setImageEngine = useSlidesStore((state) => state.setImageEngine);

  // Fetch current engine on mount
  useEffect(() => {
    if (!slug) return;

    const fetchEngine = async () => {
      try {
        const response = await imagesApi.getEngine(slug);
        setImageEngine(response.engine);
      } catch (error) {
        console.error("Failed to fetch image engine:", error);
      }
    };

    fetchEngine();
  }, [slug, setImageEngine]);

  const handleEngineChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!slug) return;

    const newEngine = event.target.value as "gemini" | "volcengine";

    try {
      await imagesApi.updateEngine(slug, newEngine);
      setImageEngine(newEngine);
    } catch (error) {
      console.error("Failed to update image engine:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-[var(--md-slate)]">引擎:</label>
      <select
        value={imageEngine}
        onChange={handleEngineChange}
        className="px-2 py-1 border-2 border-[var(--md-graphite)] rounded text-xs bg-[var(--md-cloud)] text-[var(--md-ink)] font-medium hover:bg-[var(--md-fog)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sky-strong)] transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
      >
        <option value="gemini">Google Gemini</option>
        <option value="volcengine">火山引擎 Seedream</option>
      </select>
    </div>
  );
}
