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
  MINIMAL = "minimal",
  CYBERPUNK = "cyberpunk",
  PAPERCUT = "papercut",
  INKWASH = "inkwash",
  ISOMETRIC = "isometric",
  BAUHAUS = "bauhaus",
  RETRO = "retro",
  BRUTALIST = "brutalist",
  PASTEL = "pastel",
  GRADIENT = "gradient",
  HANDDRAWN = "handdrawn",
  CUSTOM = "custom",
}

/**
 * 风格模板定义
 */
export interface StyleTemplate {
  type: StyleType;
  name: string;
  name_en: string;
  tagline: string;          // 一句话简介，用于卡片展示
  emoji: string;            // 代表性 emoji，用于视觉辨识
  description: string;      // 详细风格描述（用于 AI 图像生成提示词）
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
