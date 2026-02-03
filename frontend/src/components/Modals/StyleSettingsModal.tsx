/**
 * Style settings modal for changing existing style
 */

import { useState, useEffect } from "react";
import { Modal, Button, Textarea, Loading } from "@/components/common";
import { useStyleStore } from "@/stores";
import { cn } from "@/utils";
import type { StyleType, StyleTemplate } from "@/types";

interface StyleSettingsModalProps {
  slug: string;
  onGenerateCandidates: (prompt: string) => Promise<void>;
  onSaveStyle: (candidateId: string, styleType?: StyleType | string, styleName?: string) => Promise<void>;
}

export function StyleSettingsModal({
  slug: _slug,
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
    // 风格模板相关
    templates,
    selectedTemplate,
    isLoadingTemplates,
    loadTemplates,
    selectTemplate,
  } = useStyleStore();

  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 加载风格模板
  useEffect(() => {
    if (showSettingsModal && templates.length === 0) {
      loadTemplates();
    }
  }, [showSettingsModal, templates.length, loadTemplates]);

  const handleTemplateChange = (templateType: string) => {
    const template = templates.find((t) => t.type === templateType);
    selectTemplate(template || null);
    // 清除之前的候选图片
    setSelectedCandidate(null);
  };

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
        await onSaveStyle(
          selectedCandidate,
          selectedTemplate?.type,
          selectedTemplate?.name
        );
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Modal
      isOpen={showSettingsModal}
      onClose={closeSettingsModal}
      title="风格设置"
      className="max-w-2xl"
    >
      {/* Current style */}
      {style && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold uppercase tracking-wider">
            当前风格
            {style.style_name && (
              <span className="ml-2 text-xs font-normal text-[var(--md-slate)]">
                ({style.style_name})
              </span>
            )}
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
              <p className="text-sm text-[var(--md-ink)] line-clamp-4">{style.prompt}</p>
            </div>
          </div>
        </div>
      )}

      {/* 风格模板选择器 */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold uppercase tracking-wider">
          选择风格模板
        </label>
        {isLoadingTemplates ? (
          <div className="py-2">
            <Loading size="sm" text="加载模板中..." />
          </div>
        ) : (
          <select
            value={selectedTemplate?.type || ""}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full rounded border border-[var(--md-graphite)] bg-[var(--md-ink)] px-3 py-2 text-[var(--md-paper)] focus:border-[var(--md-sky)] focus:outline-none"
          >
            <option value="">-- 选择模板 --</option>
            {templates.map((template: StyleTemplate) => (
              <option key={template.type} value={template.type}>
                🎨 {template.name} ({template.name_en})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* New style input */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold uppercase tracking-wider">
          风格描述
        </label>
        <Textarea
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="选择模板或输入自定义风格描述..."
          className="h-32"
        />
        <Button
          onClick={handleGenerate}
          disabled={!promptInput.trim() || isGenerating}
          isLoading={isGenerating}
          className="mt-3"
        >
          生成新风格
        </Button>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="py-8">
          <Loading size="lg" text="正在生成风格预览..." />
        </div>
      )}

      {/* Candidates */}
      {candidates.length > 0 && !isGenerating && (
        <div className="mb-6">
          <label className="mb-3 block text-sm font-bold uppercase tracking-wider">
            选择新风格
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
              重新生成
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedCandidate || isSaving}
              isLoading={isSaving}
            >
              使用此风格
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
