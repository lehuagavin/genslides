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
  {
    type: StyleType.MINIMAL,
    name: "极简·留白信息风",
    name_en: "Minimal Clean Style",
    description: `大量留白与清晰网格，模块间距充足，边界轻薄。
色彩克制：米白/浅灰底（70%），深石墨文字（20%），单一强调色（10%）。
线条细而直，图形以几何块面为主，信息层级靠字号与字重区分。`,
    preview_prompt: "minimal clean design, lots of whitespace, off-white background, thin lines, single accent color, modern typography",
  },
  {
    type: StyleType.CYBERPUNK,
    name: "赛博朋克·霓虹夜景风",
    name_en: "Cyberpunk Neon Style",
    description: `深色夜景基调，霓虹青/品红对比强烈，边缘发光与光晕明显。
加入城市雨夜、全息投影、线路纹理与反射高光，形成科技感层次。
构图偏斜与透视拉伸，营造速度感与未来感。`,
    preview_prompt: "cyberpunk neon city night, dark background, magenta and cyan glow, holographic elements, rain reflections, futuristic atmosphere",
  },
  {
    type: StyleType.PAPERCUT,
    name: "剪纸·层叠浮雕风",
    name_en: "Papercut Layered Style",
    description: `多层纸片叠加的浮雕质感，边缘清晰且有柔和投影。
配色温润：奶油白/暖米色为底，辅以浅橙、豆绿、雾蓝点缀。
构图以层级分区和大色块叠放为主，整体柔和治愈。`,
    preview_prompt: "paper cut layered illustration, soft shadows, warm pastel palette, layered shapes, textured paper",
  },
  {
    type: StyleType.INKWASH,
    name: "水墨·山水留白风",
    name_en: "Ink Wash Style",
    description: `水墨晕染与干湿笔触并存，墨色由浓到淡自然过渡。
留白充足，山水、云雾、远景用稀墨虚化，点缀一枚红印。
色彩极简：黑灰为主，少量淡赭/淡蓝辅助。`,
    preview_prompt: "traditional Chinese ink wash landscape, ink gradients, minimal colors, lots of negative space, red seal",
  },
  {
    type: StyleType.ISOMETRIC,
    name: "等距·科技构图风",
    name_en: "Isometric Tech Style",
    description: `等距视角与清晰网格，模块化结构层层堆叠。
冷色主导：浅灰底（60%）、蓝青/紫蓝强调（30%）、少量亮橙点缀（10%）。
阴影轻薄，材质偏扁平，强调信息架构与层级关系。`,
    preview_prompt: "isometric tech illustration, clean grid, modular blocks, cool blue palette, subtle shadows, modern UI style",
  },
  {
    type: StyleType.BAUHAUS,
    name: "包豪斯·几何构成风",
    name_en: "Bauhaus Style",
    description: `基础几何形状（圆/方/三角）与主色块组合，比例简洁有力。
原色体系：红/黄/蓝为主，黑白灰为辅，构图强调功能与秩序。
文字排版与图形块面紧密配合，整体清爽有节奏。`,
    preview_prompt: "bauhaus design, primary colors, geometric shapes, clean composition, functional typography",
  },
  {
    type: StyleType.RETRO,
    name: "复古·70s海报风",
    name_en: "Retro 70s Poster Style",
    description: `复古粗颗粒与老纸张质感，曲线字体与复古插画元素结合。
色彩偏暖：焦糖橙/芥末黄/墨绿/奶油白，饱和度中等。
构图居中，标题醒目，带有怀旧感与复古印刷味道。`,
    preview_prompt: "retro 1970s poster, warm muted palette, grain texture, vintage typography, nostalgic illustration",
  },
  {
    type: StyleType.BRUTALIST,
    name: "粗野主义·黑白强对比风",
    name_en: "Brutalist Black & White",
    description: `极强黑白对比，粗线条与巨大标题形成视觉压迫感。
排版自由、不对齐、冲突感强，强调原始与力量。
局部使用警示红作点缀，增强视觉冲击。`,
    preview_prompt: "brutalist graphic design, black and white high contrast, bold typography, raw layout, minimal red accents",
  },
  {
    type: StyleType.PASTEL,
    name: "马卡龙·柔和插画风",
    name_en: "Pastel Soft Illustration",
    description: `柔和低饱和色块与圆角元素，整体氛围温暖轻松。
配色以浅粉/淡紫/薄荷绿/奶油黄为主，渐变过渡柔滑。
线条纤细，阴影轻浅，适合轻量信息表达。`,
    preview_prompt: "pastel soft illustration, rounded shapes, low saturation colors, gentle gradients, light shadows",
  },
  {
    type: StyleType.GRADIENT,
    name: "渐变·流体光晕风",
    name_en: "Gradient Glow Style",
    description: `大面积流体渐变与光晕层叠，营造柔软的空间感。
高亮过渡：紫/蓝/粉/青多色混合，背景深色提升对比。
元素轮廓简洁，强调光感与现代科技气质。`,
    preview_prompt: "fluid gradient glow, neon soft light, purple blue pink blend, modern abstract background, smooth transitions",
  },
  {
    type: StyleType.HANDDRAWN,
    name: "手绘·线稿涂色风",
    name_en: "Hand-drawn Sketch Style",
    description: `手绘线稿与轻微抖动笔触，边缘不完全规整。
淡彩填充：水彩质感或轻薄马克笔效果，画面更具亲和力。
构图轻松随意，适合故事化与情感表达。`,
    preview_prompt: "hand-drawn sketch, light watercolor fill, textured lines, warm friendly illustration, casual composition",
  },
];

function mergeTemplates(
  baseTemplates: StyleTemplate[],
  overrideTemplates: StyleTemplate[]
): StyleTemplate[] {
  const mergedMap = new Map<string, StyleTemplate>();
  baseTemplates.forEach((template) => {
    mergedMap.set(template.type, template);
  });
  overrideTemplates.forEach((template) => {
    mergedMap.set(template.type, template);
  });

  const baseTypes = new Set(baseTemplates.map((template) => template.type));
  const mergedInOrder = baseTemplates.map(
    (template) => mergedMap.get(template.type) || template
  );
  const extraTemplates = overrideTemplates.filter(
    (template) => !baseTypes.has(template.type)
  );

  return [...mergedInOrder, ...extraTemplates];
}

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

  // 加载风格模板（从服务器获取，合并默认模板）
  loadTemplates: async () => {
    const { isLoadingTemplates } = get();
    if (isLoadingTemplates) return; // 避免重复加载
    
    set({ isLoadingTemplates: true });
    try {
      const response = await styleApi.getStyleTemplates();
      if (response.templates && response.templates.length > 0) {
        const mergedTemplates = mergeTemplates(DEFAULT_TEMPLATES, response.templates);
        set({ templates: mergedTemplates });
        return;
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
