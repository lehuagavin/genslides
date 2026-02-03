/**
 * Style state management with Zustand
 */

import { create } from "zustand";
import type { Style, StyleCandidate, StyleTemplate } from "@/types";
import { styleApi } from "@/api";

interface StyleState {
  // State
  style: Style | null;
  candidates: StyleCandidate[];
  isGenerating: boolean;
  showSetupModal: boolean;
  showSettingsModal: boolean;
  promptInput: string;

  // 🆕 风格模板相关状态
  templates: StyleTemplate[];          // 可用的风格模板
  selectedTemplate: StyleTemplate | null;  // 当前选中的模板
  isLoadingTemplates: boolean;

  // Actions
  setStyle: (style: Style | null) => void;
  setCandidates: (candidates: StyleCandidate[]) => void;
  setGenerating: (isGenerating: boolean) => void;
  setPromptInput: (prompt: string) => void;
  openSetupModal: () => void;
  closeSetupModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  clearCandidates: () => void;
  reset: () => void;

  // 🆕 风格模板相关操作
  loadTemplates: () => Promise<void>;
  selectTemplate: (template: StyleTemplate | null) => void;
  updatePromptFromTemplate: (customPrompt?: string) => void;
}

const initialState = {
  style: null,
  candidates: [],
  isGenerating: false,
  showSetupModal: false,
  showSettingsModal: false,
  promptInput: "",
  // 🆕 风格模板初始状态
  templates: [],
  selectedTemplate: null,
  isLoadingTemplates: false,
};

export const useStyleStore = create<StyleState>((set, get) => ({
  ...initialState,

  setStyle: (style) => set({ style }),

  setCandidates: (candidates) => set({ candidates }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setPromptInput: (promptInput) => set({ promptInput }),

  openSetupModal: () => set({ showSetupModal: true }),

  closeSetupModal: () =>
    set({ showSetupModal: false, candidates: [], promptInput: "", selectedTemplate: null }),

  openSettingsModal: () => set({ showSettingsModal: true }),

  closeSettingsModal: () =>
    set({ showSettingsModal: false, candidates: [], promptInput: "", selectedTemplate: null }),

  clearCandidates: () => set({ candidates: [] }),

  reset: () => set(initialState),

  // 🆕 加载风格模板
  loadTemplates: async () => {
    set({ isLoadingTemplates: true });
    try {
      const response = await styleApi.getStyleTemplates();
      set({ templates: response.templates });
    } catch (err) {
      console.error("Failed to load style templates:", err);
    } finally {
      set({ isLoadingTemplates: false });
    }
  },

  // 🆕 选择风格模板
  selectTemplate: (template) => {
    set({
      selectedTemplate: template,
      promptInput: template?.description || "",
    });
  },

  // 🆕 从模板更新提示词
  updatePromptFromTemplate: (customPrompt) => {
    const { selectedTemplate } = get();
    if (selectedTemplate) {
      set({
        promptInput: customPrompt || selectedTemplate.description,
      });
    }
  },
}));
