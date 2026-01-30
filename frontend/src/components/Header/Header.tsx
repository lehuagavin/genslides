/**
 * Header component
 */

import { Logo } from "./Logo";
import { TitleInput } from "./TitleInput";
import { StyleBadge } from "./StyleBadge";
import { CostDisplay } from "./CostDisplay";
import { PlayButton } from "./PlayButton";
import { useSlidesStore, useStyleStore, usePlayerStore } from "@/stores";

interface HeaderProps {
  onTitleChange: (title: string) => void;
  onBackToHome?: () => void;
}

export function Header({ onTitleChange, onBackToHome }: HeaderProps): JSX.Element {
  const { title, slides, cost } = useSlidesStore();
  const { style, openSettingsModal, openSetupModal } = useStyleStore();
  const { play } = usePlayerStore();

  const handleStyleClick = () => {
    if (style) {
      openSettingsModal();
    } else {
      openSetupModal();
    }
  };

  const handlePlay = () => {
    if (slides.length > 0) {
      play(0);
    }
  };

  const canPlay = slides.length > 0 && slides.some((s) => s.current_image);

  return (
    <header className="md-eyebrow">
      <div className="flex items-center gap-6">
        {onBackToHome ? (
          <button
            onClick={onBackToHome}
            className="transition-opacity hover:opacity-70"
            title="Back to projects"
          >
            <Logo />
          </button>
        ) : (
          <Logo />
        )}
        <div className="h-6 w-px bg-[var(--md-graphite)]" />
        <TitleInput title={title} onTitleChange={onTitleChange} />
        <CostDisplay cost={cost} />
      </div>

      <div className="flex items-center gap-4">
        <StyleBadge style={style} onClick={handleStyleClick} />
        <PlayButton onClick={handlePlay} disabled={!canPlay} />
      </div>
    </header>
  );
}
