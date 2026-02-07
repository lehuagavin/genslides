/**
 * Initial style setup modal — card-grid template picker
 */

import { useState, useEffect } from "react";
import { Modal, Button, Loading } from "@/components/common";
import { useStyleStore } from "@/stores";
import { cn } from "@/utils";
import type { StyleType, StyleTemplate } from "@/types";

interface StyleSetupModalProps {
  slug: string;
  onGenerateCandidates: (prompt: string) => Promise<void>;
  onSaveStyle: (candidateId: string, styleType?: StyleType | string, styleName?: string) => Promise<void>;
}

export function StyleSetupModal({
  slug: _slug,
  onGenerateCandidates,
  onSaveStyle,
}: StyleSetupModalProps): JSX.Element {
  const {
    showSetupModal,
    candidates,
    isGenerating,
    closeSetupModal,
    templates,
    selectedTemplate,
    isLoadingTemplates,
    selectTemplate,
  } = useStyleStore();

  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPromptDetail, setShowPromptDetail] = useState(false);

  // 当模板更新后，如果没有有效选中模板，自动选择第一个
  useEffect(() => {
    if (!showSetupModal || templates.length === 0) return;

    const isSelectedValid = selectedTemplate
      ? templates.some((template) => template.type === selectedTemplate.type)
      : false;

    if (!isSelectedValid) {
      selectTemplate(templates[0]);
    }
  }, [templates, selectedTemplate, showSetupModal, selectTemplate]);

  const handleTemplateSelect = (template: StyleTemplate) => {
    selectTemplate(template);
    setSelectedCandidate(null);
    setShowPromptDetail(false);
  };

  const handleGenerate = async () => {
    const prompt = selectedTemplate?.description?.trim() || "";
    if (prompt) {
      setSelectedCandidate(null);
      await onGenerateCandidates(prompt);
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
      isOpen={showSetupModal}
      onClose={closeSetupModal}
      title="选择演示风格"
      className="max-w-3xl"
      showCloseButton={false}
    >
      <p className="mb-5 text-sm text-[var(--md-slate)]">
        选择一种视觉风格，所有幻灯片将使用该风格生成图片。
      </p>

      {/* 风格卡片网格 */}
      {isLoadingTemplates ? (
        <div className="py-6">
          <Loading size="sm" text="加载风格模板..." />
        </div>
      ) : (
        <div className="mb-5 grid grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
          {templates.map((template: StyleTemplate) => {
            const isSelected = selectedTemplate?.type === template.type;
            return (
              <button
                key={template.type}
                onClick={() => handleTemplateSelect(template)}
                className={cn(
                  "group relative flex flex-col items-start gap-1 rounded border-2 px-3 py-2.5 text-left transition-all",
                  "hover:border-[var(--md-sky)] hover:bg-[var(--md-soft-blue)]",
                  isSelected
                    ? "border-[var(--md-sky-strong)] bg-[var(--md-soft-blue)] shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    : "border-[var(--md-graphite)] bg-[var(--md-cloud)]"
                )}
              >
                <div className="flex w-full items-center gap-2">
                  <span className="text-lg leading-none">{template.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-ink)] truncate">
                    {template.name}
                  </span>
                </div>
                <p className="text-[11px] leading-snug text-[var(--md-slate)] line-clamp-2 normal-case">
                  {template.tagline}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* 选中模板信息 + 生成按钮 */}
      {selectedTemplate && (
        <div className="mb-5 rounded border border-[var(--md-graphite)] bg-[var(--md-fog)] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedTemplate.emoji}</span>
              <span className="text-sm font-bold text-[var(--md-ink)]">
                {selectedTemplate.name}
              </span>
              <span className="text-xs text-[var(--md-slate)]">
                {selectedTemplate.name_en}
              </span>
            </div>
            <button
              onClick={() => setShowPromptDetail(!showPromptDetail)}
              className="text-xs text-[var(--md-slate)] hover:text-[var(--md-ink)] transition-colors normal-case"
            >
              {showPromptDetail ? "收起详情" : "查看 AI 提示词"}
            </button>
          </div>

          {showPromptDetail && (
            <div className="mt-3 max-h-[120px] overflow-y-auto rounded bg-[var(--md-cloud)] px-3 py-2 text-xs leading-relaxed text-[var(--md-ink)] whitespace-pre-line normal-case border border-[var(--md-grid-line)]">
              {selectedTemplate.description}
            </div>
          )}

          <div className="mt-3 flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              isLoading={isGenerating}
              size="sm"
            >
              生成风格图片
            </Button>
            <span className="text-xs text-[var(--md-slate)] normal-case">
              将根据此风格生成参考图供选择
            </span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isGenerating && (
        <div className="py-8">
          <Loading size="lg" text="正在生成风格预览..." />
        </div>
      )}

      {/* Candidates */}
      {candidates.length > 0 && !isGenerating && (
        <div className="mb-5">
          <label className="mb-3 block text-sm font-bold uppercase tracking-wider">
            选择一张图片作为项目风格参考
          </label>
          <div className="grid grid-cols-2 gap-4">
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                className={cn(
                  "relative aspect-video overflow-hidden rounded border-2 transition-all",
                  "hover:border-[var(--md-sky)]",
                  selectedCandidate === candidate.id
                    ? "border-[var(--md-sky-strong)] ring-2 ring-[var(--md-sky)] shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
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
        </div>
      )}

      {/* Actions */}
      {candidates.length > 0 && !isGenerating && (
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleGenerate} size="sm">
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
      )}
    </Modal>
  );
}
