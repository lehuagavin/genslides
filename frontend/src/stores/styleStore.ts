/**
 * Style state management with Zustand
 */

import { create } from "zustand";
import type { Style, StyleCandidate } from "@/types";

interface StyleState {
  // State
  style: Style | null;
  candidates: StyleCandidate[];
  isGenerating: boolean;
  showSetupModal: boolean;
  showSettingsModal: boolean;
  promptInput: string;

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
}

const initialState = {
  style: null,
  candidates: [],
  isGenerating: false,
  showSetupModal: false,
  showSettingsModal: false,
  promptInput: "",
};

export const useStyleStore = create<StyleState>((set) => ({
  ...initialState,

  setStyle: (style) => set({ style }),

  setCandidates: (candidates) => set({ candidates }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setPromptInput: (promptInput) => set({ promptInput }),

  openSetupModal: () => set({ showSetupModal: true }),

  closeSetupModal: () =>
    set({ showSetupModal: false, candidates: [], promptInput: "" }),

  openSettingsModal: () => set({ showSettingsModal: true }),

  closeSettingsModal: () =>
    set({ showSettingsModal: false, candidates: [], promptInput: "" }),

  clearCandidates: () => set({ candidates: [] }),

  reset: () => set(initialState),
}));
