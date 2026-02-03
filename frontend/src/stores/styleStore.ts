/**
 * Style state management with Zustand
 */

import { create } from "zustand";
import type { Style, StyleCandidate, StyleTemplate } from "@/types";
import { StyleType } from "@/types";
import { styleApi } from "@/api";

// 默认风格模板（前端备用数据）
const DEFAULT_TEMPLATES: StyleTemplate[] = [
  {
    type: StyleType.GHIBLI,
    name: "吉卜力·治愈自然风",
    name_en: "Studio Ghibli Style",
    description: `手绘水彩质感背景，柔和渐变与细腻笔触营造温暖氛围。
天空云朵采用层叠晕染，自然景物（草地/树木/水面）精细描绘。色彩温润治愈：
奶油白底（60%）、天空蓝/草地绿/暖阳黄（柔和中低饱和度各15%）、点缀粉橙红（10%）。
构图遵循三分法，留白充足（25%），视觉焦点偏移中心营造叙事感，
前景中景远景层次分明，光影自然柔和呈现一天中的特定时刻。`,
    preview_prompt: "Studio Ghibli style, watercolor hand-drawn illustration, warm and healing atmosphere, soft sky and clouds, natural scenery with grass and trees",
  },
  {
    type: StyleType.DISNEY,
    name: "迪士尼·魔法奇幻风",
    name_en: "Disney Style",
    description: `饱和明快色彩，夸张流畅的曲线造型与戏剧化光影对比。
角色大眼圆润，表情生动夸张，动作充满弹性和韵律感。色彩欢快梦幻：
纯白/浅蓝天空底（50%）、宝石红/皇家蓝/金黄（高饱和主色各20%）、
魔法紫/星光银点缀（10%）。
构图对称稳定中带戏剧张力，中心放射式布局，星光/魔法粒子环绕。`,
    preview_prompt: "Disney animation style, vibrant colors, magical elements, exaggerated expressions, sparkles and fairy dust, castle silhouettes",
  },
  {
    type: StyleType.MEMPHIS,
    name: "孟菲斯·狂欢几何风",
    name_en: "Memphis Style",
    description: `高饱和撞色拼贴，随机几何图形（圆点/波浪线/三角/锯齿）无序排列。
扁平化色块无渐变，粗黑轮廓线勾边，图案密集重复制造视觉冲击。色彩狂野冲突：
白底或荧光底（40%）、荧光粉/柠檬黄/电光蓝/薄荷绿/紫罗兰（高饱和纯色各10-12%），纯黑勾线（8%）。
构图打破常规，不对称动态平衡，元素随机旋转、错位叠加。`,
    preview_prompt: "Memphis design style, bold geometric shapes, bright neon colors, asymmetric composition, dots and zigzag patterns, 1980s postmodern aesthetic",
  },
  {
    type: StyleType.GRAFFITI,
    name: "涂鸦·街头爆发风",
    name_en: "Graffiti Style",
    description: `粗糙质感底纹（砖墙/混凝土），喷漆晕染与滴落效果，野性奔放笔触。
大胆变形字体设计，3D立体阴影，描边/高光/反光多层叠加。色彩对抗强烈：
深灰/砖红墙面底（55%）、荧光橙/亮绿/洋红/天蓝（高对比强调色各10-12%），
纯白高光/纯黑阴影（15%）。
构图爆炸式扩张，中心向外辐射能量，元素溢出边界。`,
    preview_prompt: "Street graffiti art, spray paint texture, bold 3D lettering, vibrant neon colors on brick wall, urban style with drips and tags",
  },
];

interface StyleState {
  // State
  style: Style | null;
  candidates: StyleCandidate[];
  isGenerating: boolean;
  showSetupModal: boolean;
  showSettingsModal: boolean;
  promptInput: string;

  // 风格模板相关状态
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

  // 风格模板相关操作
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
  // 风格模板初始状态 - 使用默认模板
  templates: DEFAULT_TEMPLATES,
  selectedTemplate: null,
  isLoadingTemplates: false,
};

export const useStyleStore = create<StyleState>((set, get) => ({
  ...initialState,

  setStyle: (style) => set({ style }),

  setCandidates: (candidates) => set({ candidates }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setPromptInput: (promptInput) => set({ promptInput }),

  openSetupModal: () => {
    const { templates } = get();
    // 打开 modal 时自动选择第一个模板
    const firstTemplate = templates[0];
    set({
      showSetupModal: true,
      selectedTemplate: firstTemplate || null,
      promptInput: firstTemplate?.description || "",
    });
    // 尝试从服务器加载最新模板
    get().loadTemplates();
  },

  closeSetupModal: () =>
    set({ showSetupModal: false, candidates: [], promptInput: "", selectedTemplate: null }),

  openSettingsModal: () => {
    set({ showSettingsModal: true });
    // 尝试从服务器加载最新模板
    get().loadTemplates();
  },

  closeSettingsModal: () =>
    set({ showSettingsModal: false, candidates: [], promptInput: "", selectedTemplate: null }),

  clearCandidates: () => set({ candidates: [] }),

  reset: () => set(initialState),

  // 加载风格模板（从服务器获取，失败时使用默认模板）
  loadTemplates: async () => {
    const { isLoadingTemplates } = get();
    if (isLoadingTemplates) return; // 避免重复加载
    
    set({ isLoadingTemplates: true });
    try {
      const response = await styleApi.getStyleTemplates();
      if (response.templates && response.templates.length > 0) {
        set({ templates: response.templates });
      }
      // 如果服务器返回空数组，保留默认模板
    } catch (err) {
      console.error("Failed to load style templates from server, using defaults:", err);
      // API 失败时，确保使用默认模板
      const { templates } = get();
      if (templates.length === 0) {
        set({ templates: DEFAULT_TEMPLATES });
      }
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
