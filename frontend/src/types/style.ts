/**
 * Style-related type definitions
 */

/**
 * 预设风格类型枚举
 */
export enum StyleType {
  GHIBLI = "ghibli",
  DISNEY = "disney",
  MEMPHIS = "memphis",
  GRAFFITI = "graffiti",
  CUSTOM = "custom",
}

/**
 * 风格模板定义
 */
export interface StyleTemplate {
  type: StyleType;
  name: string;
  name_en: string;
  description: string;
  preview_prompt: string;
}

export interface Style {
  prompt: string;
  image: string;
  created_at: string;
  style_type?: StyleType;    // 风格类型（可选，向后兼容）
  style_name?: string;       // 风格名称（可选）
}

export interface StyleCandidate {
  id: string;
  url: string;
}
