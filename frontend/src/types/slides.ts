/**
 * Slide-related type definitions
 */

import type { Style } from "./style";

export interface SlideImage {
  hash: string;
  url: string;
  thumbnail_url?: string;
  created_at: string;
  matched: boolean;
}

export interface Slide {
  sid: string;
  content: string;
  created_at: string;
  updated_at: string;
  current_image: SlideImage | null;
  images?: SlideImage[]; // All generated images for this slide
}

export interface CostInfo {
  total_images: number;
  estimated_cost: number;
  currency: string;
  style_generations?: number;
  slide_generations?: number;
  breakdown?: {
    style_cost: number;
    slides_cost: number;
  };
}

export interface Project {
  slug: string;
  title: string;
  created_at: string;
  updated_at: string;
  style: Style | null;
  slides: Slide[];
  cost: CostInfo;
  image_engine: "gemini" | "volcengine";
}

export interface ProjectSummary {
  slug: string;
  title: string;
  created_at: string;
  updated_at: string;
  slide_count: number;
  has_style: boolean;
}

// Re-export Style from style.ts
export type { Style } from "./style";
