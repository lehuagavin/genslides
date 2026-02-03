/**
 * Initial style setup modal
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
    // 风格模板相关
    templates,
    selectedTemplate,
    isLoadingTemplates,
    selectTemplate,
  } = useStyleStore();

  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleTemplateChange = (templateType: string) => {
    const template = templates.find((t) => t.type === templateType);
    selectTemplate(template || null);
    // 清除之前的候选图片
    setSelectedCandidate(null);
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
      title="设置项目风格"
      className="max-w-2xl"
      showCloseButton={false}
    >
      <p className="mb-4 text-[var(--md-slate)]">
        选择一个预设风格模板，然后生成风格参考图片。
      </p>

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
            className="w-full rounded border border-[var(--md-graphite)] bg-white px-3 py-2 text-gray-900 focus:border-[var(--md-sky)] focus:outline-none"
          >
            <option value="" disabled className="bg-white text-gray-900">
              -- 选择模板 --
            </option>
            {templates.map((template: StyleTemplate) => (
              <option key={template.type} value={template.type} className="bg-white text-gray-900">
                🎨 {template.name} ({template.name_en})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 风格描述展示 */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold uppercase tracking-wider">
          风格描述
        </label>
        <div
          className={cn(
            "min-h-[160px] rounded border border-[var(--md-graphite)] bg-[var(--md-fog)] px-4 py-3 text-sm",
            "whitespace-pre-line text-[var(--md-ink)]",
            !selectedTemplate && "text-[var(--md-slate)]"
          )}
        >
          {selectedTemplate ? selectedTemplate.description : "请选择风格模板以查看描述"}
        </div>
        <p className="mt-1 text-xs text-[var(--md-slate)]">
          选择模板后即可生成风格参考图
        </p>
        <Button
          onClick={handleGenerate}
          disabled={!selectedTemplate?.description?.trim() || isGenerating}
          isLoading={isGenerating}
          className="mt-3"
        >
          生成风格图片
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
            选择一张图片作为项目风格参考
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
        </div>
      )}

      {/* Actions */}
      {candidates.length > 0 && !isGenerating && (
        <div className="flex justify-end gap-3">
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
      )}
    </Modal>
  );
}
