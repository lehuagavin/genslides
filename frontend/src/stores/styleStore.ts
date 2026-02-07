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
    name: "吉卜力",
    name_en: "Ghibli",
    emoji: "🌿",
    tagline: "水彩手绘，温暖治愈，宫崎骏式的自然美学",
    description: `演示文稿背景，吉卜力动画风格。
视觉基调：手绘水彩质感，柔和渐变晕染，笔触细腻温暖。天空云朵层叠晕开，草地树木水面描绘精致，光影柔和呈现自然时刻。
色彩体系：奶油白为底色，搭配天空蓝、草地绿、暖阳黄等中低饱和色调，点缀少量粉橙红，整体温润治愈。
构图与质感：三分法构图，留白充足，视觉焦点偏移中心营造叙事感。前景中景远景层次分明，画面充满生命力——飘动的发丝、风吹草动、光斑洒落。`,
    preview_prompt: "吉卜力动画风格演示文稿背景，水彩手绘插画，温暖治愈氛围，柔和天空云朵，草地树木自然景物",
  },
  {
    type: StyleType.DISNEY,
    name: "迪士尼",
    name_en: "Disney",
    emoji: "✨",
    tagline: "明快色彩与魔法粒子，梦幻童话般的奇幻风格",
    description: `演示文稿背景，迪士尼经典动画风格。
视觉基调：饱和明快的色彩，流畅的曲线造型，戏剧化的光影对比。画面充满童话般的梦幻感，星光闪烁、魔法粒子飘舞、花瓣飞扬。
色彩体系：纯白与浅蓝天空为底，搭配宝石红、皇家蓝、金黄等高饱和主色，点缀魔法紫与星光银，整体欢快梦幻。
构图与质感：对称稳定中带戏剧张力，中心放射式布局，星光与魔法光环环绕。景深明显，前景剪影衬托中景主体，远景隐现城堡塔尖。`,
    preview_prompt: "迪士尼动画风格演示文稿背景，鲜艳色彩，魔法元素，星光粒子飘舞，城堡剪影",
  },
  {
    type: StyleType.MEMPHIS,
    name: "孟菲斯",
    name_en: "Memphis",
    emoji: "🔶",
    tagline: "撞色几何拼贴，80 年代后现代主义视觉狂欢",
    description: `演示文稿背景，孟菲斯设计风格。
视觉基调：高饱和撞色拼贴，几何图形（圆点、波浪线、三角、锯齿）随机排列。扁平色块无渐变，粗黑轮廓线勾边，图案密集重复，视觉冲击力强。
色彩体系：白底或荧光底色，搭配荧光粉、柠檬黄、电光蓝、薄荷绿、紫罗兰等高饱和纯色，纯黑勾线统一整体。
构图与质感：打破常规的不对称动态平衡，元素随机旋转、错位叠加、尺寸对比强烈，网格与自由形状混搭，画面饱满充满活力。`,
    preview_prompt: "孟菲斯设计风格演示文稿背景，大胆几何图形，明亮霓虹撞色，不对称构图，圆点锯齿波浪线图案",
  },
  {
    type: StyleType.GRAFFITI,
    name: "涂鸦街头",
    name_en: "Graffiti",
    emoji: "🎤",
    tagline: "喷漆质感与立体字体，充满张力的街头艺术",
    description: `演示文稿背景，街头涂鸦艺术风格。
视觉基调：粗糙的砖墙或混凝土底纹，喷漆晕染与墨迹滴落效果，笔触狂野奔放。大胆变形的立体字母设计，带有3D阴影与多层描边高光。
色彩体系：深灰或砖红墙面为底，搭配荧光橙、亮绿、洋红、天蓝等高对比强调色，纯白高光与纯黑阴影增强层次。
构图与质感：爆炸式向外扩张的构图，能量从中心辐射，元素溢出边界。画面充满街头符号——喷漆颗粒、滴墨痕迹、撕裂边缘、贴纸碎片。`,
    preview_prompt: "街头涂鸦艺术风格演示文稿背景，喷漆质感，立体彩色字母，砖墙底纹，霓虹色彩滴墨效果",
  },
  {
    type: StyleType.MINIMAL,
    name: "极简留白",
    name_en: "Minimal",
    emoji: "◻️",
    tagline: "大量留白与清晰网格，用克制传达高级感",
    description: `演示文稿背景，极简主义设计风格。
视觉基调：大面积留白，清晰的网格系统，模块间距充裕。线条纤细笔直，图形以简洁几何块面为主，整体克制、精致、高级。
色彩体系：米白或浅灰为底色，深石墨色用于主要元素，仅使用一种强调色（如冷蓝或暖橙）作为视觉锚点，色彩极度克制。
构图与质感：严格的网格对齐，层级关系通过大小与间距区分而非装饰。表面干净无杂质，质感平滑，传达专业与秩序感。`,
    preview_prompt: "极简主义演示文稿背景，大量留白，米白底色，细线条，单一强调色，现代排版",
  },
  {
    type: StyleType.CYBERPUNK,
    name: "赛博朋克",
    name_en: "Cyberpunk",
    emoji: "🌃",
    tagline: "霓虹光晕与暗夜基调，充满科技感的未来世界",
    description: `演示文稿背景，赛博朋克未来科技风格。
视觉基调：深色夜景基调，霓虹灯光穿透黑暗，边缘发光与光晕效果明显。融入城市雨夜、全息投影、电路纹理与湿地面反射高光，层次丰富。
色彩体系：深黑或深紫蓝为底，霓虹青与品红形成强烈对比，搭配电光蓝与冷白色高光，暗处有微弱的紫色环境光。
构图与质感：偏斜的视角与透视拉伸，营造速度感与未来感。雨滴粒子、光线拖尾、数据流动感的细节元素点缀画面。`,
    preview_prompt: "赛博朋克风格演示文稿背景，霓虹夜景城市，深色底，品红与青色光晕，全息投影，雨夜反射",
  },
  {
    type: StyleType.PAPERCUT,
    name: "剪纸浮雕",
    name_en: "Papercut",
    emoji: "🧧",
    tagline: "多层纸片叠加的立体质感，温润柔和的配色",
    description: `演示文稿背景，剪纸艺术立体风格。
视觉基调：多层纸片叠加形成浮雕般的立体深度，每层边缘清晰利落，层间有柔和的自然投影。纸张质感真实可感，表面微微粗糙。
色彩体系：奶油白或暖米色为底层，上层叠加浅橙、豆绿、雾蓝、淡粉等温润色彩，色块之间过渡自然和谐。
构图与质感：以层级分区和大色块叠放为主要构图方式，前后景通过纸层深度拉开空间。整体柔和治愈，手工艺感十足。`,
    preview_prompt: "剪纸分层艺术风格演示文稿背景，多层纸片叠加，柔和投影，温暖粉彩配色，纸张质感",
  },
  {
    type: StyleType.INKWASH,
    name: "水墨山水",
    name_en: "Ink Wash",
    emoji: "🏔️",
    tagline: "墨色浓淡与大片留白，东方美学的极致表达",
    description: `演示文稿背景，中国传统水墨画风格。
视觉基调：水墨晕染与干湿笔触并存，墨色由浓到淡自然过渡。远山近水以稀墨虚化，云雾缭绕间若隐若现。大片留白赋予画面呼吸感与诗意。
色彩体系：黑灰墨色为主，少量淡赭石或淡蓝色辅助渲染，点缀一枚朱红印章作为视觉焦点，整体色彩极度克制。
构图与质感：疏密有致的经典山水构图，虚实相生。笔墨质感真实——干笔皴擦与湿墨洇开并存，宣纸底纹隐约可见。`,
    preview_prompt: "中国水墨山水画风格演示文稿背景，墨色浓淡渐变，大片留白，云雾山水，朱红印章",
  },
  {
    type: StyleType.ISOMETRIC,
    name: "等距科技",
    name_en: "Isometric",
    emoji: "📐",
    tagline: "等距视角与模块化结构，清晰展示信息层级",
    description: `演示文稿背景，等距视角科技插画风格。
视觉基调：严格的等距透视网格，模块化的几何结构层层堆叠。阴影轻薄统一，材质偏扁平化处理，整体清晰有序、专业感强。
色彩体系：浅灰或极淡蓝为底，蓝青色与紫蓝色为主要强调色，少量亮橙色作为信息焦点的视觉锚点，冷色主导传达科技与理性。
构图与质感：信息架构式的层级排列，模块之间间距规整。表面质感干净扁平，边缘利落，整体传达数据化与系统化的视觉印象。`,
    preview_prompt: "等距视角科技插画演示文稿背景，清晰网格，模块化方块，冷蓝色调，轻薄阴影，现代UI风格",
  },
  {
    type: StyleType.BAUHAUS,
    name: "包豪斯",
    name_en: "Bauhaus",
    emoji: "🔴",
    tagline: "基础几何与原色体系，形式追随功能的经典设计",
    description: `演示文稿背景，包豪斯设计风格。
视觉基调：基础几何形状——圆形、方形、三角形——与纯色块的精确组合。比例简洁有力，每个元素都服务于功能，没有多余装饰。
色彩体系：以红、黄、蓝三原色为主，黑白灰为辅助与分隔色，色块之间边界清晰干脆，对比鲜明而有秩序。
构图与质感：强调功能与秩序的理性构图，几何块面与排版紧密配合。表面平滑无质感，形式追随功能，整体清爽、有节奏、充满设计感。`,
    preview_prompt: "包豪斯设计风格演示文稿背景，红黄蓝三原色，基础几何形状，简洁构图，功能主义排版",
  },
  {
    type: StyleType.RETRO,
    name: "70s 复古",
    name_en: "Retro 70s",
    emoji: "📻",
    tagline: "粗颗粒质感与暖色调，致敬七十年代的怀旧美学",
    description: `演示文稿背景，七十年代复古海报风格。
视觉基调：明显的胶片粗颗粒质感与老旧纸张肌理，曲线装饰字体与复古插画元素交织。画面仿佛旧海报经过岁月的洗礼，带有印刷错版的微妙偏差。
色彩体系：焦糖橙、芥末黄、墨绿、奶油白为主色调，饱和度中等偏暖，整体色调如同褪色老照片般温暖怀旧。
构图与质感：居中对称的经典海报构图，主标题醒目突出。粗颗粒噪点覆盖全画面，边缘轻微磨损做旧，弥漫着浓浓的怀旧味道。`,
    preview_prompt: "七十年代复古海报风格演示文稿背景，暖色调，焦糖橙芥末黄，粗颗粒质感，复古排版，怀旧插画",
  },
  {
    type: StyleType.BRUTALIST,
    name: "粗野主义",
    name_en: "Brutalist",
    emoji: "⬛",
    tagline: "极强黑白对比与粗线条，原始有力的视觉冲击",
    description: `演示文稿背景，粗野主义平面设计风格。
视觉基调：极端的黑白对比，粗重的线条与巨大的字体块面形成强烈的视觉压迫感。排版自由不受约束，元素故意不对齐、不对称，冲突感与张力贯穿画面。
色彩体系：纯黑与纯白为绝对主导，仅在关键处使用少量警示红作为视觉锤，其余不使用任何中间色调。
构图与质感：反精致的原始布局，粗糙直接，强调力量感与叛逆精神。元素边缘硬朗锐利，仿佛是用高对比度复印机直接输出的效果。`,
    preview_prompt: "粗野主义平面设计风格演示文稿背景，纯黑白高对比，粗线条巨大字体，原始不对称布局，少量红色点缀",
  },
  {
    type: StyleType.PASTEL,
    name: "马卡龙",
    name_en: "Pastel",
    emoji: "🍬",
    tagline: "低饱和柔和色块与圆角元素，轻松温暖的插画气质",
    description: `演示文稿背景，马卡龙柔和插画风格。
视觉基调：低饱和度的柔和色块与圆角元素，整体氛围温暖轻松、甜而不腻。线条纤细柔软，阴影轻浅透明，所有形状边角都温柔圆润。
色彩体系：浅粉、淡紫、薄荷绿、奶油黄、天蓝为主色调，色与色之间渐变过渡柔滑，没有生硬的边界与对比。
构图与质感：轻量化的构图，元素间距宽松舒适。表面质感如磨砂般柔和，仿佛糖霜覆盖，营造出甜美而专业的视觉印象。`,
    preview_prompt: "马卡龙色柔和插画风格演示文稿背景，圆角元素，低饱和浅粉淡紫薄荷绿，柔和渐变，轻薄阴影",
  },
  {
    type: StyleType.GRADIENT,
    name: "流体渐变",
    name_en: "Gradient",
    emoji: "🌈",
    tagline: "流体渐变与光晕层叠，现代感十足的视觉体验",
    description: `演示文稿背景，流体渐变光效风格。
视觉基调：大面积的流体渐变色彩自然流淌，多层光晕相互叠加，营造出柔软而有深度的空间感。色彩边界消融，仿佛光在空气中弥散。
色彩体系：紫色、蓝色、粉色、青色多色混合渐变，背景使用深色以提升光感对比度。高光区域明亮通透，暗部深邃而富有层次。
构图与质感：元素轮廓简洁模糊，强调光感流动与色彩呼吸。表面如同液态玻璃般顺滑，整体传达现代科技与高端时尚的气质。`,
    preview_prompt: "流体渐变光效风格演示文稿背景，紫蓝粉青多色渐变，霓虹柔光，深色底衬，现代抽象光晕",
  },
  {
    type: StyleType.HANDDRAWN,
    name: "手绘涂色",
    name_en: "Hand-drawn",
    emoji: "✏️",
    tagline: "手绘线稿与水彩淡填，亲切自然的手工质感",
    description: `演示文稿背景，手绘线稿涂色风格。
视觉基调：自然的手绘线稿，笔触带有轻微抖动与不规则感，边缘不完全整齐。填色采用水彩晕染或马克笔轻涂效果，透明度较高，底层线稿隐约可见。
色彩体系：暖色调为主的淡彩填充——浅杏、淡黄、雾蓝、草绿，饱和度偏低，色彩间相互渗透融合，整体亲切温暖。
构图与质感：轻松随意的构图，不追求严格对齐。纸张底纹质感真实可感，铅笔线条与水彩痕迹并存，传达出手工创作的温度与亲和力。`,
    preview_prompt: "手绘线稿涂色风格演示文稿背景，铅笔线条轻微抖动，水彩淡填色，纸张质感，温暖亲切插画",
  },
];

function mergeTemplates(
  baseTemplates: StyleTemplate[],
  overrideTemplates: StyleTemplate[]
): StyleTemplate[] {
  const overrideMap = new Map<string, StyleTemplate>();
  overrideTemplates.forEach((template) => {
    overrideMap.set(template.type, template);
  });

  // 字段级合并：保留前端的 tagline/emoji，用后端覆盖 description 等字段
  const baseTypes = new Set(baseTemplates.map((t) => t.type));
  const mergedInOrder = baseTemplates.map((base) => {
    const override = overrideMap.get(base.type);
    if (!override) return base;
    return {
      ...base,
      ...override,
      // 前端专用字段：如果后端没提供则保留前端值
      emoji: override.emoji || base.emoji,
      tagline: override.tagline || base.tagline,
    };
  });

  // 追加后端新增的、前端没有的模板
  const extraTemplates = overrideTemplates
    .filter((t) => !baseTypes.has(t.type))
    .map((t) => ({
      ...t,
      emoji: t.emoji || "🎨",
      tagline: t.tagline || t.name,
    }));

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
