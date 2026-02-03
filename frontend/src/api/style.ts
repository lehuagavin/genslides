/**
 * Style API client
 */

import type { Style, StyleCandidate, StyleTemplate, StyleType } from "@/types";
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
  style_type?: string;
  style_name?: string;
}

export interface SaveStyleResponse {
  success: boolean;
  style: Style;
}

// 风格模板相关接口
export interface StyleTemplatesResponse {
  templates: StyleTemplate[];
}

export interface GenerateStyleFromTemplateRequest {
  style_type: string;
  custom_prompt?: string;
}

export interface GenerateStyleFromTemplateResponse {
  candidates: StyleCandidate[];
  template: StyleTemplate;
}

export const styleApi = {
  /**
   * 获取所有可用的预设风格模板
   */
  getStyleTemplates(): Promise<StyleTemplatesResponse> {
    return api.get<StyleTemplatesResponse>("/style/templates");
  },

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
   * 基于预设模板生成风格候选图像
   */
  generateStyleFromTemplate(
    slug: string,
    styleType: StyleType | string,
    customPrompt?: string
  ): Promise<GenerateStyleFromTemplateResponse> {
    return api.post<GenerateStyleFromTemplateResponse>(
      `/slides/${slug}/style/generate-from-template`,
      {
        style_type: styleType,
        custom_prompt: customPrompt,
      }
    );
  },

  /**
   * Save selected style
   */
  saveStyle(
    slug: string,
    prompt: string,
    candidateId: string,
    styleType?: StyleType | string,
    styleName?: string
  ): Promise<SaveStyleResponse> {
    return api.put<SaveStyleResponse>(`/slides/${slug}/style`, {
      prompt,
      candidate_id: candidateId,
      style_type: styleType,
      style_name: styleName,
    });
  },
};
