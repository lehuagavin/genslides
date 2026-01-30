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
      <label className="text-sm font-medium text-gray-600">引擎:</label>
      <select
        value={imageEngine}
        onChange={handleEngineChange}
        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <option value="gemini">Google Gemini</option>
        <option value="volcengine">火山引擎 Seedream</option>
      </select>
    </div>
  );
}
