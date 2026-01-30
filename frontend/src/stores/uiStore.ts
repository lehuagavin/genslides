/**
 * UI state management with Zustand
 */

import { create } from "zustand";

export interface Toast {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  duration?: number;
}

interface UIState {
  // State
  toasts: Toast[];
  isSidebarCollapsed: boolean;
  generatingSlides: Set<string>; // Set of sids currently generating

  // Actions
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addGeneratingSlide: (sid: string) => void;
  removeGeneratingSlide: (sid: string) => void;
  setGeneratingSlides: (sids: string[]) => void;
  isSlideGenerating: (sid: string) => boolean;
  reset: () => void;
}

const initialState = {
  toasts: [] as Toast[],
  isSidebarCollapsed: false,
  generatingSlides: new Set<string>(),
};

let toastId = 0;

export const useUIStore = create<UIState>((set, get) => ({
  ...initialState,

  addToast: (toast) => {
    const id = `toast-${++toastId}`;
    const newToast: Toast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  toggleSidebar: () =>
    set((state) => ({
      isSidebarCollapsed: !state.isSidebarCollapsed,
    })),

  setSidebarCollapsed: (collapsed) =>
    set({ isSidebarCollapsed: collapsed }),

  addGeneratingSlide: (sid) =>
    set((state) => {
      const newSet = new Set(state.generatingSlides);
      newSet.add(sid);
      return { generatingSlides: newSet };
    }),

  removeGeneratingSlide: (sid) =>
    set((state) => {
      const newSet = new Set(state.generatingSlides);
      newSet.delete(sid);
      return { generatingSlides: newSet };
    }),

  setGeneratingSlides: (sids) =>
    set({ generatingSlides: new Set(sids) }),

  isSlideGenerating: (sid) => get().generatingSlides.has(sid),

  reset: () =>
    set({
      ...initialState,
      generatingSlides: new Set<string>(),
    }),
}));
