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
        name="吉卜力·治愈自然风",
        name_en="Studio Ghibli Style",
        description="""手绘水彩质感背景，柔和渐变与细腻笔触营造温暖氛围。
天空云朵采用层叠晕染，自然景物（草地/树木/水面）精细描绘。色彩温润治愈：
奶油白底（60%）、天空蓝/草地绿/暖阳黄（柔和中低饱和度各15%）、点缀粉橙红（10%）。
构图遵循三分法，留白充足（25%），视觉焦点偏移中心营造叙事感，
前景中景远景层次分明，光影自然柔和呈现一天中的特定时刻。
字体：标题用圆润手写体或童趣宋体（36pt），正文用温和黑体/明朝体（16pt），
强调文字用手写书法体。细节充满生命力，包含飘动的发丝、风吹草动、
光斑洒落、水汽氤氲，适合儿童教育、旅游推广、环保主题及温馨品牌，
为投影和纸质印刷优化，呈现手工质感和情感共鸣。""",
        preview_prompt="Studio Ghibli style, watercolor hand-drawn illustration, warm and healing atmosphere, soft sky and clouds, natural scenery with grass and trees",
    ),
    StyleType.DISNEY: StyleTemplate(
        type=StyleType.DISNEY,
        name="迪士尼·魔法奇幻风",
        name_en="Disney Style",
        description="""饱和明快色彩，夸张流畅的曲线造型与戏剧化光影对比。
角色大眼圆润，表情生动夸张，动作充满弹性和韵律感（Squash & Stretch）。色彩欢快梦幻：
纯白/浅蓝天空底（50%）、宝石红/皇家蓝/金黄（高饱和主色各20%）、
魔法紫/星光银点缀（10%）。
构图对称稳定中带戏剧张力，中心放射式布局，星光/魔法粒子环绕，
景深明显，前景剪影+中景主体+远景城堡塔尖，留白15%。
字体：标题用经典衬线童话体或圆润卡通字体（42pt），正文用友好无衬线体（18pt），
特殊词汇用花体/手写签名体。细节富含魔法元素，包含星光闪烁、
丝带飘扬、音符跳动、花瓣飞舞，适合家庭娱乐、儿童产品、主题乐园及
节日庆典，为高清大屏和动画演示优化，传递快乐与梦想。""",
        preview_prompt="Disney animation style, vibrant colors, magical elements, exaggerated expressions, sparkles and fairy dust, castle silhouettes",
    ),
    StyleType.MEMPHIS: StyleTemplate(
        type=StyleType.MEMPHIS,
        name="孟菲斯·狂欢几何风",
        name_en="Memphis Style",
        description="""高饱和撞色拼贴，随机几何图形（圆点/波浪线/三角/锯齿）无序排列。
扁平化色块无渐变，粗黑轮廓线勾边，图案密集重复制造视觉冲击。色彩狂野冲突：
白底或荧光底（40%）、荧光粉/柠檬黄/电光蓝/薄荷绿/紫罗兰（
高饱和纯色各10-12%），纯黑勾线（8%）。
构图打破常规，不对称动态平衡，元素随机旋转、错位叠加、尺寸对比强烈，
网格与自由形状混搭，留白仅5-10%制造饱满张力。
字体：标题用粗黑几何无衬线体或解构字体（48pt），正文用简洁Grotesque字体（20pt），
数字用夸张装饰体。细节层次丰富，包含半色调网点、细碎图案填充、
色块投影错位、线条装饰边框，适合时尚品牌、音乐节海报、潮流活动及
年轻社群营销，为数字屏幕和社交媒体优化，传递叛逆与活力。""",
        preview_prompt="Memphis design style, bold geometric shapes, bright neon colors, asymmetric composition, dots and zigzag patterns, 1980s postmodern aesthetic",
    ),
    StyleType.GRAFFITI: StyleTemplate(
        type=StyleType.GRAFFITI,
        name="涂鸦·街头爆发风",
        name_en="Graffiti Style",
        description="""粗糙质感底纹（砖墙/混凝土），喷漆晕染与滴落效果，野性奔放笔触。
大胆变形字体设计，3D立体阴影，描边/高光/反光多层叠加。色彩对抗强烈：
深灰/砖红墙面底（55%）、荧光橙/亮绿/洋红/天蓝（高对比强调色各10-12%），
纯白高光/纯黑阴影（15%）。
构图爆炸式扩张，中心向外辐射能量，元素溢出边界，透视夸张变形，
箭头/星爆/速度线引导视线，留白几乎为0营造压迫感。
字体：标题用手绘涂鸦字体或泡泡字/野风格（Wildstyle）（50pt+），
正文用手写标签体或模版字（20pt），标签（Tag）用快速签名体。
细节充满街头符号，包含喷漆颗粒、滴墨痕迹、撕裂边缘、贴纸元素、
二维码/卡通角色点缀，适合街头品牌、音乐专辑、极限运动及青年文化活动，
为户外广告牌和城市大屏优化，传递反叛与自由精神。""",
        preview_prompt="Street graffiti art, spray paint texture, bold 3D lettering, vibrant neon colors on brick wall, urban style with drips and tags",
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
