/**
 * Slides state management with Zustand
 */

import { create } from "zustand";
import type { Slide, SlideImage, CostInfo } from "@/types";

interface SlidesState {
  // State
  slug: string | null;
  title: string;
  slides: Slide[];
  selectedSid: string | null;
  isLoading: boolean;
  error: string | null;
  cost: CostInfo | null;
  displayedImageHash: Record<string, string>; // sid -> displayed image hash

  // Actions
  setSlug: (slug: string) => void;
  setTitle: (title: string) => void;
  setSlides: (slides: Slide[]) => void;
  selectSlide: (sid: string | null) => void;
  addSlide: (slide: Slide, afterSid?: string) => void;
  updateSlide: (sid: string, content: string) => void;
  updateSlideImage: (sid: string, image: SlideImage) => void;
  deleteSlideImage: (sid: string, imageHash: string) => void;
  setDisplayedImage: (sid: string, hash: string) => void;
  deleteSlide: (sid: string) => void;
  reorderSlides: (order: string[]) => void;
  setCost: (cost: CostInfo) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Load displayedImageHash from localStorage
function loadDisplayedImageHash(): Record<string, string> {
  try {
    const stored = localStorage.getItem("genslides:displayedImageHash");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save displayedImageHash to localStorage
function saveDisplayedImageHash(hash: Record<string, string>): void {
  try {
    localStorage.setItem("genslides:displayedImageHash", JSON.stringify(hash));
  } catch {
    // Ignore storage errors
  }
}

const initialState = {
  slug: null,
  title: "",
  slides: [],
  selectedSid: null,
  isLoading: false,
  error: null,
  cost: null,
  displayedImageHash: loadDisplayedImageHash(),
};

export const useSlidesStore = create<SlidesState>((set) => ({
  ...initialState,

  setSlug: (slug) => set({ slug }),

  setTitle: (title) => set({ title }),

  setSlides: (slides) =>
    set((state) => ({
      // Ensure current_image is in images array for each slide
      slides: slides.map((slide) => {
        let images = slide.images || [];
        // If current_image exists but not in images array, add it
        if (slide.current_image && !images.some((img) => img.hash === slide.current_image!.hash)) {
          images = [...images, slide.current_image];
        }
        return { ...slide, images };
      }),
      // Select first slide if none selected
      selectedSid: state.selectedSid ?? slides[0]?.sid ?? null,
    })),

  selectSlide: (sid) => set({ selectedSid: sid }),

  addSlide: (slide, afterSid) =>
    set((state) => {
      const newSlides = [...state.slides];
      if (afterSid) {
        const index = newSlides.findIndex((s) => s.sid === afterSid);
        if (index !== -1) {
          newSlides.splice(index + 1, 0, slide);
        } else {
          newSlides.push(slide);
        }
      } else {
        newSlides.push(slide);
      }
      return { slides: newSlides, selectedSid: slide.sid };
    }),

  updateSlide: (sid, content) =>
    set((state) => ({
      slides: state.slides.map((s) => {
        if (s.sid !== sid) return s;
        // When content changes, mark all images as not matched
        const updatedImages = s.images?.map((img) => ({ ...img, matched: false }));
        const updatedCurrentImage = s.current_image
          ? { ...s.current_image, matched: false }
          : null;
        return {
          ...s,
          content,
          updated_at: new Date().toISOString(),
          images: updatedImages,
          current_image: updatedCurrentImage,
        };
      }),
    })),

  updateSlideImage: (sid, image) =>
    set((state) => ({
      slides: state.slides.map((s) => {
        if (s.sid !== sid) return s;
        
        // Build existing images array, including current_image if not in array
        let existingImages = s.images || [];
        
        // If current_image exists but not in images array, add it first
        if (s.current_image && !existingImages.some((img) => img.hash === s.current_image!.hash)) {
          existingImages = [...existingImages, s.current_image];
        }
        
        // Add new image if not already present
        const hasNewImage = existingImages.some((img) => img.hash === image.hash);
        const newImages = hasNewImage ? existingImages : [...existingImages, image];
        
        return { ...s, current_image: image, images: newImages };
      }),
      // Auto-select the new image for display
      displayedImageHash: (() => {
        const newHash = { ...state.displayedImageHash, [sid]: image.hash };
        saveDisplayedImageHash(newHash);
        return newHash;
      })(),
    })),

  setDisplayedImage: (sid, hash) =>
    set((state) => {
      const newHash = { ...state.displayedImageHash, [sid]: hash };
      saveDisplayedImageHash(newHash);
      return { displayedImageHash: newHash };
    }),

  deleteSlideImage: (sid, imageHash) =>
    set((state) => {
      const newDisplayedImageHash = { ...state.displayedImageHash };

      return {
        slides: state.slides.map((s) => {
          if (s.sid !== sid) return s;

          // Remove the image from images array
          const newImages = s.images?.filter((img) => img.hash !== imageHash) || [];

          // Update current_image if it was the deleted one
          let newCurrentImage = s.current_image;
          if (s.current_image?.hash === imageHash) {
            newCurrentImage = newImages.length > 0 ? newImages[newImages.length - 1] : null;
          }

          // Update displayed image if it was the deleted one
          if (state.displayedImageHash[sid] === imageHash) {
            if (newImages.length > 0) {
              newDisplayedImageHash[sid] = newImages[newImages.length - 1].hash;
            } else {
              delete newDisplayedImageHash[sid];
            }
            saveDisplayedImageHash(newDisplayedImageHash);
          }

          return {
            ...s,
            images: newImages,
            current_image: newCurrentImage,
          };
        }),
        displayedImageHash: newDisplayedImageHash,
      };
    }),

  deleteSlide: (sid) =>
    set((state) => {
      const newSlides = state.slides.filter((s) => s.sid !== sid);
      let newSelectedSid = state.selectedSid;

      if (state.selectedSid === sid) {
        const index = state.slides.findIndex((s) => s.sid === sid);
        newSelectedSid =
          newSlides[index]?.sid ?? newSlides[index - 1]?.sid ?? null;
      }

      return { slides: newSlides, selectedSid: newSelectedSid };
    }),

  reorderSlides: (order) =>
    set((state) => {
      const slideMap = new Map(state.slides.map((s) => [s.sid, s]));
      const newSlides = order
        .map((sid) => slideMap.get(sid))
        .filter((s): s is Slide => s !== undefined);
      return { slides: newSlides };
    }),

  setCost: (cost) => set({ cost }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

// Selector hooks for common patterns
export const useSelectedSlide = (): Slide | null => {
  return useSlidesStore((state) => {
    if (!state.selectedSid) return null;
    return state.slides.find((s) => s.sid === state.selectedSid) ?? null;
  });
};

export const useSlideByIndex = (index: number): Slide | null => {
  return useSlidesStore((state) => state.slides[index] ?? null);
};
