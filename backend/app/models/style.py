"""Style domain models."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class StyleType(str, Enum):
    """预设风格类型枚举"""

    GHIBLI = "ghibli"  # 吉卜力风格
    DISNEY = "disney"  # 迪士尼风格
    MEMPHIS = "memphis"  # 孟菲斯风格
    GRAFFITI = "graffiti"  # 涂鸦艺术风格
    CUSTOM = "custom"  # 自定义风格


@dataclass
class StyleTemplate:
    """风格模板定义"""

    type: StyleType
    name: str  # 中文名称
    name_en: str  # 英文名称
    description: str  # 详细风格描述（用于图像生成）
    preview_prompt: str  # 预览图生成提示词（简化版）


# 预设风格模板配置
STYLE_TEMPLATES: dict[StyleType, StyleTemplate] = {
    StyleType.GHIBLI: StyleTemplate(
        type=StyleType.GHIBLI,
        name="吉卜力",
        name_en="Ghibli",
        description="""演示文稿背景，吉卜力动画风格。
视觉基调：手绘水彩质感，柔和渐变晕染，笔触细腻温暖。天空云朵层叠晕开，草地树木水面描绘精致，光影柔和呈现自然时刻。
色彩体系：奶油白为底色，搭配天空蓝、草地绿、暖阳黄等中低饱和色调，点缀少量粉橙红，整体温润治愈。
构图与质感：三分法构图，留白充足，视觉焦点偏移中心营造叙事感。前景中景远景层次分明，画面充满生命力——飘动的发丝、风吹草动、光斑洒落。""",
        preview_prompt="吉卜力动画风格演示文稿背景，水彩手绘插画，温暖治愈氛围，柔和天空云朵，草地树木自然景物",
    ),
    StyleType.DISNEY: StyleTemplate(
        type=StyleType.DISNEY,
        name="迪士尼",
        name_en="Disney",
        description="""演示文稿背景，迪士尼经典动画风格。
视觉基调：饱和明快的色彩，流畅的曲线造型，戏剧化的光影对比。画面充满童话般的梦幻感，星光闪烁、魔法粒子飘舞、花瓣飞扬。
色彩体系：纯白与浅蓝天空为底，搭配宝石红、皇家蓝、金黄等高饱和主色，点缀魔法紫与星光银，整体欢快梦幻。
构图与质感：对称稳定中带戏剧张力，中心放射式布局，星光与魔法光环环绕。景深明显，前景剪影衬托中景主体，远景隐现城堡塔尖。""",
        preview_prompt="迪士尼动画风格演示文稿背景，鲜艳色彩，魔法元素，星光粒子飘舞，城堡剪影",
    ),
    StyleType.MEMPHIS: StyleTemplate(
        type=StyleType.MEMPHIS,
        name="孟菲斯",
        name_en="Memphis",
        description="""演示文稿背景，孟菲斯设计风格。
视觉基调：高饱和撞色拼贴，几何图形（圆点、波浪线、三角、锯齿）随机排列。扁平色块无渐变，粗黑轮廓线勾边，图案密集重复，视觉冲击力强。
色彩体系：白底或荧光底色，搭配荧光粉、柠檬黄、电光蓝、薄荷绿、紫罗兰等高饱和纯色，纯黑勾线统一整体。
构图与质感：打破常规的不对称动态平衡，元素随机旋转、错位叠加、尺寸对比强烈，网格与自由形状混搭，画面饱满充满活力。""",
        preview_prompt="孟菲斯设计风格演示文稿背景，大胆几何图形，明亮霓虹撞色，不对称构图，圆点锯齿波浪线图案",
    ),
    StyleType.GRAFFITI: StyleTemplate(
        type=StyleType.GRAFFITI,
        name="涂鸦街头",
        name_en="Graffiti",
        description="""演示文稿背景，街头涂鸦艺术风格。
视觉基调：粗糙的砖墙或混凝土底纹，喷漆晕染与墨迹滴落效果，笔触狂野奔放。大胆变形的立体字母设计，带有3D阴影与多层描边高光。
色彩体系：深灰或砖红墙面为底，搭配荧光橙、亮绿、洋红、天蓝等高对比强调色，纯白高光与纯黑阴影增强层次。
构图与质感：爆炸式向外扩张的构图，能量从中心辐射，元素溢出边界。画面充满街头符号——喷漆颗粒、滴墨痕迹、撕裂边缘、贴纸碎片。""",
        preview_prompt="街头涂鸦艺术风格演示文稿背景，喷漆质感，立体彩色字母，砖墙底纹，霓虹色彩滴墨效果",
    ),
}


@dataclass
class Style:
    """Represents the visual style of a presentation."""

    prompt: str
    image: str  # relative path to style image
    created_at: datetime = field(default_factory=datetime.now)
    style_type: StyleType | None = None  # 风格类型（可选，向后兼容）
    style_name: str | None = None  # 风格名称（可选）


@dataclass
class StyleCandidate:
    """Represents a candidate style image during style selection."""

    id: str
    path: str  # relative path to candidate image
