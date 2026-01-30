/**
 * Player state management with Zustand
 */

import { create } from "zustand";

interface PlayerState {
  // State
  isPlaying: boolean;
  currentIndex: number;
  isFullscreen: boolean;

  // Actions
  play: (startIndex?: number) => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  reset: () => void;
}

const initialState = {
  isPlaying: false,
  currentIndex: 0,
  isFullscreen: false,
};

export const usePlayerStore = create<PlayerState>((set) => ({
  ...initialState,

  play: (startIndex) =>
    set((state) => ({
      isPlaying: true,
      currentIndex: startIndex ?? state.currentIndex,
      isFullscreen: true,
    })),

  pause: () => set({ isPlaying: false }),

  next: () =>
    set((state) => ({
      currentIndex: state.currentIndex + 1,
    })),

  prev: () =>
    set((state) => ({
      currentIndex: Math.max(0, state.currentIndex - 1),
    })),

  goTo: (index) => set({ currentIndex: index }),

  enterFullscreen: () => set({ isFullscreen: true }),

  exitFullscreen: () => set({ isFullscreen: false, isPlaying: false }),

  reset: () => set(initialState),
}));
