/**
 * Header component
 */

import { Logo } from "./Logo";
import { TitleInput } from "./TitleInput";
import { StyleBadge } from "./StyleBadge";
import { CostDisplay } from "./CostDisplay";
import { PlayButton } from "./PlayButton";
import { ExportButton } from "./ExportButton";
import { EngineSelector } from "./EngineSelector";
import { useSlidesStore, useStyleStore, usePlayerStore } from "@/stores";

interface HeaderProps {
  onTitleChange: (title: string) => void;
  onBackToHome?: () => void;
}

export function Header({ onTitleChange, onBackToHome }: HeaderProps): JSX.Element {
  const { slug, title, slides, cost } = useSlidesStore();
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

      <div className="flex items-center gap-2 [&_.md-btn+.md-btn]:!ml-0">
        <EngineSelector />
        <div className="h-5 w-px bg-[var(--md-graphite)] opacity-25" />
        <StyleBadge style={style} onClick={handleStyleClick} />
        {slug && (
          <ExportButton
            slug={slug}
            disabled={!slides.some((s) => s.current_image)}
          />
        )}
        <PlayButton onClick={handlePlay} disabled={!canPlay} />
      </div>
    </header>
  );
}
