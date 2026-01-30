/**
 * Play button for fullscreen presentation
 */

import { Button } from "@/components/common";

interface PlayButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function PlayButton({ onClick, disabled }: PlayButtonProps): JSX.Element {
  return (
    <Button onClick={onClick} disabled={disabled} size="sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="mr-1"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      Play
    </Button>
  );
}
