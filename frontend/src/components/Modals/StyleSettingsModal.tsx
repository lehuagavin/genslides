/**
 * Style settings modal for changing existing style
 */

import { useState } from "react";
import { Modal, Button, Textarea, Loading } from "@/components/common";
import { useStyleStore } from "@/stores";
import { cn } from "@/utils";

interface StyleSettingsModalProps {
  slug: string;
  onGenerateCandidates: (prompt: string) => Promise<void>;
  onSaveStyle: (candidateId: string) => Promise<void>;
}

export function StyleSettingsModal({
  slug,
  onGenerateCandidates,
  onSaveStyle,
}: StyleSettingsModalProps): JSX.Element {
  const {
    showSettingsModal,
    style,
    candidates,
    isGenerating,
    promptInput,
    setPromptInput,
    closeSettingsModal,
  } = useStyleStore();

  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (promptInput.trim()) {
      setSelectedCandidate(null);
      await onGenerateCandidates(promptInput);
    }
  };

  const handleSave = async () => {
    if (selectedCandidate) {
      setIsSaving(true);
      try {
        await onSaveStyle(selectedCandidate);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Modal
      isOpen={showSettingsModal}
      onClose={closeSettingsModal}
      title="Style Settings"
      className="max-w-2xl"
    >
      {/* Current style */}
      {style && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold uppercase tracking-wider">
            Current Style
          </label>
          <div className="flex gap-4">
            <div className="h-24 w-40 overflow-hidden border-2 border-[var(--md-graphite)]">
              <img
                src={style.image}
                alt="Current style"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--md-ink)]">{style.prompt}</p>
            </div>
          </div>
        </div>
      )}

      {/* New style input */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold uppercase tracking-wider">
          Change Style
        </label>
        <Textarea
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Describe a new style..."
          className="h-24"
        />
        <Button
          onClick={handleGenerate}
          disabled={!promptInput.trim() || isGenerating}
          isLoading={isGenerating}
          className="mt-3"
        >
          Generate New Styles
        </Button>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="py-8">
          <Loading size="lg" text="Generating style previews..." />
        </div>
      )}

      {/* Candidates */}
      {candidates.length > 0 && !isGenerating && (
        <div className="mb-6">
          <label className="mb-3 block text-sm font-bold uppercase tracking-wider">
            Choose a New Style
          </label>
          <div className="grid grid-cols-2 gap-4">
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                className={cn(
                  "relative aspect-video overflow-hidden border-2 transition-all",
                  "hover:border-[var(--md-sky)]",
                  selectedCandidate === candidate.id
                    ? "border-[var(--md-sky-strong)] ring-2 ring-[var(--md-sky)]"
                    : "border-[var(--md-graphite)]"
                )}
              >
                <img
                  src={candidate.url}
                  alt="Style option"
                  className="h-full w-full object-cover"
                />
                {selectedCandidate === candidate.id && (
                  <div className="absolute right-2 top-2 rounded-full bg-[var(--md-sky-strong)] p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={handleGenerate}>
              Regenerate
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedCandidate || isSaving}
              isLoading={isSaving}
            >
              Use This Style
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
