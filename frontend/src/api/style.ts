/**
 * Style API client
 */

import type { Style, StyleCandidate } from "@/types";
import { api } from "./client";

export interface GetStyleResponse {
  has_style: boolean;
  style: Style | null;
}

export interface GenerateStyleRequest {
  prompt: string;
}

export interface GenerateStyleResponse {
  candidates: StyleCandidate[];
  prompt: string;
}

export interface SaveStyleRequest {
  prompt: string;
  candidate_id: string;
}

export interface SaveStyleResponse {
  success: boolean;
  style: Style;
}

export const styleApi = {
  /**
   * Get current style
   */
  getStyle(slug: string): Promise<GetStyleResponse> {
    return api.get<GetStyleResponse>(`/slides/${slug}/style`);
  },

  /**
   * Generate candidate style images
   */
  generateStyle(
    slug: string,
    prompt: string
  ): Promise<GenerateStyleResponse> {
    return api.post<GenerateStyleResponse>(`/slides/${slug}/style/generate`, {
      prompt,
    });
  },

  /**
   * Save selected style
   */
  saveStyle(
    slug: string,
    prompt: string,
    candidateId: string
  ): Promise<SaveStyleResponse> {
    return api.put<SaveStyleResponse>(`/slides/${slug}/style`, {
      prompt,
      candidate_id: candidateId,
    });
  },
};
