/**
 * Export button component - downloads project as ZIP with numbered JPG images
 */

import { useState } from "react";
import { imagesApi } from "@/api";
import { Button } from "@/components/common";

interface ExportButtonProps {
  slug: string;
  disabled?: boolean;
}

export function ExportButton({ slug, disabled = false }: ExportButtonProps): JSX.Element {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting || disabled) return;

    setIsExporting(true);
    try {
      const blob = await imagesApi.exportProject(slug);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled}
      isLoading={isExporting}
      size="sm"
      variant="secondary"
    >
      {!isExporting && (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          ZIP
        </>
      )}
    </Button>
  );
}
