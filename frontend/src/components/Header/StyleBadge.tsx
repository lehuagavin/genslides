/**
 * Style badge component showing current style
 */

import { Button } from "@/components/common";
import type { Style } from "@/types";

interface StyleBadgeProps {
  style: Style | null;
  onClick: () => void;
}

export function StyleBadge({ style, onClick }: StyleBadgeProps): JSX.Element {
  return (
    <Button
      onClick={onClick}
      size="sm"
      variant={style ? "primary" : "secondary"}
    >
      {style ? (
        <>
          <span className="mr-1 h-4 w-4 overflow-hidden rounded-full border border-[var(--md-graphite)]">
            <img
              src={style.image}
              alt="Style"
              className="h-full w-full object-cover"
            />
          </span>
          Style
        </>
      ) : (
        "Style"
      )}
    </Button>
  );
}
