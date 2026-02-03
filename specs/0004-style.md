# 设计文档：预设风格模板系统

**文档编号**: 0004
**创建日期**: 2026-02-03
**状态**: 设计阶段

## 1. 概述

### 1.1 背景

当前系统中，用户在创建项目时需要手动输入风格描述（Style Prompt），这对新用户不够友好。为了提升用户体验，我们需要提供预设的风格模板，让用户可以快速选择并生成符合特定美学风格的幻灯片。

### 1.2 目标

1. **提供4种预设风格模板**：吉卜力风格、迪士尼风格、孟菲斯风格、涂鸦艺术风格
2. **支持下拉选择**：用户可以从预设模板中快速选择
3. **支持自定义编辑**：用户可以在选择预设后继续编辑风格描述
4. **确保风格一致性**：每次生成 Slide 图像时自动携带项目的风格描述和参考图片

### 1.3 适用范围

- 新建项目时的风格选择流程
- 风格设置和编辑功能
- Slide 图像生成流程

---

## 2. 需求分析

### 2.1 功能需求

| 需求ID | 需求描述 | 优先级 |
|--------|---------|--------|
| FR-001 | 系统提供4种预设风格模板（吉卜力、迪士尼、孟菲斯、涂鸦） | P0 |
| FR-002 | 用户在新建项目时可以选择预设风格模板 | P0 |
| FR-003 | 用户可以编辑选中的风格描述文本 | P0 |
| FR-004 | 用户可以为选中的风格生成参考图片 | P0 |
| FR-005 | 每次生成 Slide 图像时自动携带项目风格描述 | P0 |
| FR-006 | 用户可以在项目创建后修改风格模板 | P1 |
| FR-007 | 支持自定义风格（不使用预设模板） | P1 |

### 2.2 非功能需求

| 需求ID | 需求描述 | 优先级 |
|--------|---------|--------|
| NFR-001 | 风格模板数据应可配置，便于后续扩展 | P0 |
| NFR-002 | 风格描述应存储在项目元数据中 | P0 |
| NFR-003 | UI 响应时间 < 200ms（风格切换） | P1 |
| NFR-004 | 向后兼容现有项目（无风格类型字段） | P0 |

---

## 3. 技术设计

### 3.1 数据模型设计

#### 3.1.1 预设风格模板数据结构

**位置**: `backend/app/models/style.py`

```python
from dataclasses import dataclass
from enum import Enum

class StyleType(str, Enum):
    """预设风格类型枚举"""
    GHIBLI = "ghibli"           # 吉卜力风格
    DISNEY = "disney"           # 迪士尼风格
    MEMPHIS = "memphis"         # 孟菲斯风格
    GRAFFITI = "graffiti"       # 涂鸦艺术风格
    CUSTOM = "custom"           # 自定义风格

@dataclass
class StyleTemplate:
    """风格模板定义"""
    type: StyleType
    name: str                   # 中文名称
    name_en: str                # 英文名称
    description: str            # 详细风格描述（用于图像生成）
    preview_prompt: str         # 预览图生成提示词（简化版）

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
        preview_prompt="Studio Ghibli style, watercolor hand-drawn illustration, warm and healing atmosphere, soft sky and clouds, natural scenery with grass and trees"
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
        preview_prompt="Disney animation style, vibrant colors, magical elements, exaggerated expressions, sparkles and fairy dust, castle silhouettes"
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
        preview_prompt="Memphis design style, bold geometric shapes, bright neon colors, asymmetric composition, dots and zigzag patterns, 1980s postmodern aesthetic"
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
        preview_prompt="Street graffiti art, spray paint texture, bold 3D lettering, vibrant neon colors on brick wall, urban style with drips and tags"
    ),
}
```

#### 3.1.2 Style 数据模型扩展

**位置**: `backend/app/models/style.py`

```python
@dataclass
class Style:
    prompt: str                          # 风格描述提示词
    image: str                           # 相对路径（style/style.jpg）
    created_at: datetime
    style_type: StyleType | None = None  # 🆕 风格类型（可选，向后兼容）
    style_name: str | None = None        # 🆕 风格名称（可选）
```

**YAML 存储格式** (`slides/{slug}/outline.yml`)：

```yaml
style:
  prompt: "手绘水彩质感背景，柔和渐变..."
  image: "style/style.jpg"
  created_at: "2026-02-03T10:30:00"
  style_type: "ghibli"                    # 新增字段
  style_name: "吉卜力·治愈自然风"          # 新增字段
```

### 3.2 API 设计

#### 3.2.1 新增 API 端点

**位置**: `backend/app/api/routes/style.py`

##### 1. 获取预设风格模板列表

```python
@router.get("/templates", response_model=StyleTemplatesResponse)
async def get_style_templates() -> StyleTemplatesResponse:
    """
    获取所有可用的预设风格模板

    Returns:
        {
            "templates": [
                {
                    "type": "ghibli",
                    "name": "吉卜力·治愈自然风",
                    "name_en": "Studio Ghibli Style",
                    "description": "手绘水彩质感背景...",
                    "preview_prompt": "Studio Ghibli style..."
                },
                ...
            ]
        }
    """
    pass
```

##### 2. 基于模板生成风格候选

```python
@router.post("/{slug}/style/generate-from-template", response_model=GenerateStyleResponse)
async def generate_style_from_template(
    slug: str,
    request: GenerateStyleFromTemplateRequest,
    service: Annotated[StyleService, Depends(get_style_service)],
) -> GenerateStyleResponse:
    """
    基于预设模板生成风格候选图像

    Request Body:
        {
            "style_type": "ghibli",
            "custom_prompt": "手绘水彩质感背景..."  # 可选，用户编辑后的提示词
        }

    Returns:
        {
            "candidates": [
                {"id": "candidate-abc123", "url": "..."},
                {"id": "candidate-def456", "url": "..."}
            ],
            "template": {
                "type": "ghibli",
                "name": "吉卜力·治愈自然风",
                ...
            }
        }
    """
    pass
```

##### 3. 保存风格（扩展现有 API）

```python
@router.put("/{slug}/style", response_model=SaveStyleResponse)
async def save_style(
    slug: str,
    request: SaveStyleRequest,
    service: Annotated[StyleService, Depends(get_style_service)],
) -> SaveStyleResponse:
    """
    保存选中的风格候选为项目风格

    Request Body:
        {
            "prompt": "手绘水彩质感背景...",
            "candidate_id": "candidate-abc123",
            "style_type": "ghibli",        # 🆕 新增字段
            "style_name": "吉卜力·治愈自然风"  # 🆕 新增字段
        }

    Returns:
        {
            "style": {
                "prompt": "...",
                "image": "style/style.jpg",
                "created_at": "...",
                "style_type": "ghibli",
                "style_name": "吉卜力·治愈自然风"
            }
        }
    """
    pass
```

#### 3.2.2 Schema 定义

**位置**: `backend/app/api/schemas/style.py`

```python
from pydantic import BaseModel
from app.models.style import StyleType

# 请求 Schema
class GenerateStyleFromTemplateRequest(BaseModel):
    style_type: StyleType
    custom_prompt: str | None = None

class SaveStyleRequest(BaseModel):
    prompt: str
    candidate_id: str
    style_type: StyleType | None = None     # 🆕
    style_name: str | None = None           # 🆕

# 响应 Schema
class StyleTemplateResponse(BaseModel):
    type: str
    name: str
    name_en: str
    description: str
    preview_prompt: str

class StyleTemplatesResponse(BaseModel):
    templates: list[StyleTemplateResponse]

class StyleResponse(BaseModel):
    prompt: str
    image: str
    created_at: str
    style_type: str | None = None           # 🆕
    style_name: str | None = None           # 🆕

class GenerateStyleFromTemplateResponse(BaseModel):
    candidates: list[StyleCandidateResponse]
    template: StyleTemplateResponse
```

### 3.3 服务层设计

#### 3.3.1 StyleService 扩展

**位置**: `backend/app/services/style_service.py`

```python
class StyleService:

    @staticmethod
    def get_style_templates() -> list[StyleTemplate]:
        """获取所有预设风格模板"""
        return list(STYLE_TEMPLATES.values())

    @staticmethod
    def get_template_by_type(style_type: StyleType) -> StyleTemplate | None:
        """根据类型获取风格模板"""
        return STYLE_TEMPLATES.get(style_type)

    async def generate_candidates_from_template(
        self,
        slug: str,
        style_type: StyleType,
        custom_prompt: str | None = None,
    ) -> tuple[list[StyleCandidate], StyleTemplate]:
        """
        基于预设模板生成风格候选

        Args:
            slug: 项目 slug
            style_type: 风格类型
            custom_prompt: 自定义提示词（可选，优先级高于模板默认）

        Returns:
            (候选列表, 使用的模板)
        """
        template = self.get_template_by_type(style_type)
        if not template:
            raise InvalidRequestError(f"Unknown style type: {style_type}")

        # 使用自定义提示词或模板默认提示词
        prompt = custom_prompt or template.description

        # 调用现有生成逻辑
        candidates = await self.generate_candidates(slug, prompt)

        return candidates, template

    async def save_style(
        self,
        slug: str,
        prompt: str,
        candidate_id: str,
        style_type: StyleType | None = None,
        style_name: str | None = None,
    ) -> Style:
        """
        保存选中的风格

        Args:
            slug: 项目 slug
            prompt: 风格描述
            candidate_id: 候选 ID
            style_type: 风格类型（可选）
            style_name: 风格名称（可选）
        """
        # 现有保存逻辑...
        style = Style(
            prompt=prompt,
            image="style/style.jpg",
            created_at=datetime.now(),
            style_type=style_type,      # 🆕
            style_name=style_name,      # 🆕
        )
        # 保存到项目...
        return style
```

### 3.4 前端设计

#### 3.4.1 类型定义扩展

**位置**: `frontend/src/types/style.ts`

```typescript
export enum StyleType {
  GHIBLI = "ghibli",
  DISNEY = "disney",
  MEMPHIS = "memphis",
  GRAFFITI = "graffiti",
  CUSTOM = "custom",
}

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
  style_type?: StyleType;    // 🆕 可选字段
  style_name?: string;       // 🆕 可选字段
}
```

#### 3.4.2 API 客户端扩展

**位置**: `frontend/src/api/style.ts`

```typescript
export const styleApi = {
  // 现有方法...

  // 🆕 获取风格模板列表
  async getStyleTemplates(): Promise<StyleTemplate[]> {
    const response = await apiClient.get<{ templates: StyleTemplate[] }>(
      '/api/style/templates'
    );
    return response.templates;
  },

  // 🆕 基于模板生成风格候选
  async generateStyleFromTemplate(
    slug: string,
    styleType: StyleType,
    customPrompt?: string
  ): Promise<{ candidates: StyleCandidate[]; template: StyleTemplate }> {
    const response = await apiClient.post(
      `/api/slides/${slug}/style/generate-from-template`,
      {
        style_type: styleType,
        custom_prompt: customPrompt,
      }
    );
    return response;
  },

  // 🆕 保存风格（扩展参数）
  async saveStyle(
    slug: string,
    prompt: string,
    candidateId: string,
    styleType?: StyleType,
    styleName?: string
  ): Promise<{ style: Style }> {
    const response = await apiClient.put(
      `/api/slides/${slug}/style`,
      {
        prompt,
        candidate_id: candidateId,
        style_type: styleType,
        style_name: styleName,
      }
    );
    return response;
  },
};
```

#### 3.4.3 状态管理扩展

**位置**: `frontend/src/stores/styleStore.ts`

```typescript
interface StyleState {
  // 现有状态...

  // 🆕 新增状态
  templates: StyleTemplate[];          // 可用的风格模板
  selectedTemplate: StyleTemplate | null;  // 当前选中的模板
  isLoadingTemplates: boolean;

  // 🆕 新增操作
  loadTemplates: () => Promise<void>;
  selectTemplate: (template: StyleTemplate) => void;
  updatePromptFromTemplate: (customPrompt?: string) => void;
}

export const useStyleStore = create<StyleState>((set, get) => ({
  // 现有实现...

  // 🆕 新增实现
  templates: [],
  selectedTemplate: null,
  isLoadingTemplates: false,

  loadTemplates: async () => {
    set({ isLoadingTemplates: true });
    try {
      const templates = await styleApi.getStyleTemplates();
      set({ templates });
    } catch (err) {
      console.error('Failed to load style templates:', err);
    } finally {
      set({ isLoadingTemplates: false });
    }
  },

  selectTemplate: (template) => {
    set({
      selectedTemplate: template,
      promptInput: template.description,  // 自动填充描述
    });
  },

  updatePromptFromTemplate: (customPrompt) => {
    const { selectedTemplate } = get();
    if (selectedTemplate) {
      set({
        promptInput: customPrompt || selectedTemplate.description
      });
    }
  },
}));
```

#### 3.4.4 UI 组件设计

##### StyleSetupModal 改造

**位置**: `frontend/src/components/Modals/StyleSetupModal.tsx`

**UI 布局**:

```
┌────────────────────────────────────────────────────┐
│           设置项目风格                              │
├────────────────────────────────────────────────────┤
│                                                    │
│  选择风格模板：                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ 🎨 吉卜力·治愈自然风              ▼          │ │  ← 下拉选择框
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  风格描述：                                        │
│  ┌──────────────────────────────────────────────┐ │
│  │ 手绘水彩质感背景，柔和渐变与细腻笔触营造      │ │
│  │ 温暖氛围。天空云朵采用层叠晕染...           │ │  ← 可编辑文本框
│  │                                              │ │
│  │                                              │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌────────────────┐                               │
│  │  生成风格图片   │                               │  ← 生成按钮
│  └────────────────┘                               │
│                                                    │
│  选择一张图片作为项目风格参考：                      │
│  ┌──────────┐  ┌──────────┐                       │
│  │          │  │          │                       │
│  │  候选1    │  │  候选2    │                       │  ← 候选图片（生成后显示）
│  │          │  │          │                       │
│  └──────────┘  └──────────┘                       │
│  [ 选择 ]      [ 选择 ]                           │
│                                                    │
│              [ 取消 ]  [ 确定 ]                    │
└────────────────────────────────────────────────────┘
```

**组件实现**:

```typescript
export function StyleSetupModal() {
  const {
    templates,
    selectedTemplate,
    promptInput,
    candidates,
    isGenerating,
    loadTemplates,
    selectTemplate,
    generateCandidatesFromTemplate,
    saveStyle,
  } = useStyleStore();

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleTemplateChange = (templateType: StyleType) => {
    const template = templates.find(t => t.type === templateType);
    if (template) {
      selectTemplate(template);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    await generateCandidatesFromTemplate(
      selectedTemplate.type,
      promptInput
    );
  };

  const handleSave = async (candidateId: string) => {
    if (!selectedTemplate) return;
    await saveStyle(
      promptInput,
      candidateId,
      selectedTemplate.type,
      selectedTemplate.name
    );
  };

  return (
    <Modal title="设置项目风格">
      {/* 风格模板选择器 */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">
          选择风格模板
        </label>
        <Select
          value={selectedTemplate?.type}
          onChange={handleTemplateChange}
        >
          {templates.map(template => (
            <option key={template.type} value={template.type}>
              🎨 {template.name}
            </option>
          ))}
        </Select>
      </div>

      {/* 风格描述编辑器 */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">
          风格描述
        </label>
        <Textarea
          value={promptInput}
          onChange={(e) => updatePromptInput(e.target.value)}
          rows={8}
          placeholder="请选择风格模板或输入自定义描述..."
        />
      </div>

      {/* 生成按钮 */}
      <Button
        onClick={handleGenerate}
        disabled={!promptInput || isGenerating}
      >
        {isGenerating ? '生成中...' : '生成风格图片'}
      </Button>

      {/* 候选图片展示 */}
      {candidates.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium">
            选择一张图片作为项目风格参考
          </p>
          <div className="grid grid-cols-2 gap-4">
            {candidates.map(candidate => (
              <div key={candidate.id} className="border rounded p-2">
                <img
                  src={candidate.url}
                  alt="Style candidate"
                  className="w-full h-auto rounded mb-2"
                />
                <Button
                  onClick={() => handleSave(candidate.id)}
                  variant="primary"
                  size="sm"
                >
                  选择
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
```

##### HomePage 新建项目流程改造

**位置**: `frontend/src/components/HomePage/HomePage.tsx`

**新流程**:

```
1. 用户输入项目名称
2. 点击"创建项目"
3. 生成 slug
4. 跳转到 ProjectEditor
5. 自动打开 StyleSetupModal
   - 默认选中第一个模板（吉卜力风格）
   - 自动填充风格描述
6. 用户可以：
   - 切换风格模板
   - 编辑风格描述
   - 生成风格候选图片
   - 选择一张作为项目风格
```

### 3.5 图像生成流程改造

#### 3.5.1 Slide 图像生成携带风格信息

**位置**: `backend/app/services/image_service.py`

```python
class ImageService:

    async def generate_slide_image(
        self,
        slug: str,
        sid: str,
        regenerate: bool = False,
    ) -> SlideImage:
        """
        生成幻灯片图像

        流程：
        1. 获取项目和幻灯片信息
        2. 获取项目风格（Style）
        3. 构建完整的图像生成提示词
        4. 调用图像引擎生成
        5. 保存图像并更新元数据
        """
        project = await self.slides_repository.get_project(slug)
        slide = project.get_slide(sid)

        # 🆕 构建包含风格的完整提示词
        full_prompt = self._build_slide_prompt(
            slide_content=slide.content,
            style=project.style,
        )

        # 调用图像引擎
        engine = self._get_engine(project)
        image_data = await engine.generate_slide_image(
            prompt=full_prompt,
            style_image_path=self._get_style_image_path(slug, project.style),
        )

        # 保存图像
        slide_image = await self.image_repository.save_slide_image(
            slug, sid, image_data
        )

        # 更新幻灯片元数据
        slide.images.append(slide_image)
        project.updated_at = datetime.now()
        await self.slides_repository.save_project(project)

        return slide_image

    def _build_slide_prompt(
        self,
        slide_content: str,
        style: Style | None,
    ) -> str:
        """
        构建完整的图像生成提示词

        格式：
        [风格描述]

        幻灯片内容：
        [幻灯片内容]
        """
        if not style:
            return slide_content

        return f"""{style.prompt}

幻灯片内容：
{slide_content}"""

    def _get_style_image_path(
        self,
        slug: str,
        style: Style | None,
    ) -> str | None:
        """获取风格参考图片的绝对路径"""
        if not style or not style.image:
            return None

        base_path = self.config.slides_base_path
        return f"{base_path}/{slug}/{style.image}"
```

#### 3.5.2 图像引擎接口扩展

**位置**: `backend/app/services/image_generation_service.py`

```python
from abc import ABC, abstractmethod

class ImageGenerationService(ABC):

    @abstractmethod
    async def generate_slide_image(
        self,
        prompt: str,
        style_image_path: str | None = None,  # 🆕 风格参考图片路径
    ) -> bytes:
        """
        生成幻灯片图像

        Args:
            prompt: 完整提示词（包含风格描述+幻灯片内容）
            style_image_path: 风格参考图片路径（可选，用于图像引导）

        Returns:
            图像二进制数据（JPEG 格式）
        """
        pass
```

**Gemini 实现** (`backend/app/services/gemini_service.py`):

```python
class GeminiImageService(ImageGenerationService):

    async def generate_slide_image(
        self,
        prompt: str,
        style_image_path: str | None = None,
    ) -> bytes:
        """
        使用 Gemini Imagen 3 生成图像

        支持风格参考图片作为引导
        """
        # 准备请求
        request_body = {
            "prompt": prompt,
            "number_of_images": 1,
            "aspect_ratio": "16:9",
        }

        # 🆕 如果提供了风格参考图片，添加到请求中
        if style_image_path and os.path.exists(style_image_path):
            with open(style_image_path, "rb") as f:
                style_image_base64 = base64.b64encode(f.read()).decode()
            request_body["reference_images"] = [
                {
                    "image": {"bytesBase64Encoded": style_image_base64},
                    "reference_type": "STYLE",  # 指定为风格参考
                }
            ]

        # 调用 Gemini API
        response = await self._call_api(request_body)
        return response["images"][0]["bytesBase64Encoded"]
```

**VolcEngine 实现** (`backend/app/services/volcengine_service.py`):

```python
class VolcEngineImageService(ImageGenerationService):

    async def generate_slide_image(
        self,
        prompt: str,
        style_image_path: str | None = None,
    ) -> bytes:
        """
        使用 VolcEngine 图像生成

        注意：VolcEngine 可能不支持风格图片引导，
        风格信息已包含在 prompt 中
        """
        request_body = {
            "req_key": self._generate_req_key(),
            "prompt": prompt,
            "width": 1024,
            "height": 1024,
            "scale": 3.5,
            "seed": -1,
            "logo_info": {"add_logo": False},
        }

        # VolcEngine 目前不支持风格图片引导
        # 所有风格信息通过 prompt 传递

        response = await self._call_api(request_body)
        return base64.b64decode(response["data"]["image_urls"][0])
```

---

## 4. 实现计划

### 4.1 开发阶段

#### 阶段 1：后端基础设施（2-3 小时）

- [ ] 定义风格模板数据结构 (`models/style.py`)
- [ ] 扩展 Style 数据模型（添加 `style_type` 和 `style_name` 字段）
- [ ] 添加新 API 端点（`/api/style/templates`, `/api/slides/{slug}/style/generate-from-template`）
- [ ] 扩展 StyleService 服务层方法
- [ ] 更新 Schema 定义
- [ ] 编写单元测试

#### 阶段 2：前端 UI 组件（2-3 小时）

- [ ] 扩展 TypeScript 类型定义
- [ ] 扩展 API 客户端方法
- [ ] 扩展状态管理（`styleStore`）
- [ ] 改造 StyleSetupModal 组件
  - [ ] 添加风格模板下拉选择器
  - [ ] 添加风格描述编辑框
  - [ ] 实现模板切换逻辑
- [ ] 更新 HomePage 新建项目流程
- [ ] 编写组件测试

#### 阶段 3：图像生成集成（1-2 小时）

- [ ] 改造 ImageService 的 `generate_slide_image` 方法
- [ ] 扩展图像引擎接口（支持风格参考图片）
- [ ] 更新 Gemini 集成（添加风格图片引导）
- [ ] 更新 VolcEngine 集成（确认是否支持风格图片）
- [ ] 测试端到端图像生成流程

#### 阶段 4：测试与优化（1-2 小时）

- [ ] 集成测试（完整用户流程）
- [ ] 性能测试（风格切换响应时间）
- [ ] UI/UX 优化（加载状态、错误提示）
- [ ] 向后兼容性测试（现有项目无风格类型字段）
- [ ] 文档更新

### 4.2 测试用例

#### 单元测试

| 测试用例 | 描述 | 预期结果 |
|---------|------|---------|
| test_get_style_templates | 获取预设风格模板列表 | 返回4个模板 |
| test_get_template_by_type | 根据类型获取模板 | 返回正确的模板对象 |
| test_generate_from_template | 基于模板生成候选 | 生成2张候选图片 |
| test_save_style_with_type | 保存风格并包含类型信息 | Style 对象包含 style_type 和 style_name |
| test_build_slide_prompt | 构建包含风格的提示词 | 提示词包含风格描述+幻灯片内容 |

#### 集成测试

| 测试用例 | 描述 | 步骤 | 预期结果 |
|---------|------|------|---------|
| test_new_project_with_template | 新建项目并选择风格模板 | 1. 创建项目<br>2. 选择吉卜力模板<br>3. 生成候选<br>4. 保存风格 | outline.yml 包含完整风格信息 |
| test_edit_template_prompt | 编辑模板提示词 | 1. 选择模板<br>2. 编辑描述<br>3. 生成候选 | 使用编辑后的描述生成 |
| test_slide_generation_with_style | 生成 Slide 图像携带风格 | 1. 设置项目风格<br>2. 创建幻灯片<br>3. 生成图像 | 图像符合风格特征 |
| test_backward_compatibility | 向后兼容性 | 加载无 style_type 字段的旧项目 | 正常加载，不报错 |

### 4.3 数据迁移

#### 现有项目数据

- **兼容性策略**：现有项目的 `outline.yml` 中没有 `style_type` 和 `style_name` 字段
- **处理方式**：
  - 后端读取时将这两个字段设为 `None`（可选字段）
  - 前端显示时，如果没有 `style_type`，则显示为"自定义风格"
  - 用户可以在风格设置中重新选择模板或继续使用自定义风格

#### 迁移脚本（可选）

如果需要为现有项目自动识别风格类型：

```python
# scripts/migrate_style_types.py

import yaml
from pathlib import Path
from app.models.style import STYLE_TEMPLATES, StyleType

def detect_style_type(prompt: str) -> tuple[StyleType | None, str | None]:
    """基于提示词内容检测最匹配的风格类型"""
    for style_type, template in STYLE_TEMPLATES.items():
        # 简单相似度匹配（可以使用更复杂的算法）
        if template.description[:100] in prompt:
            return style_type, template.name
    return None, None

def migrate_project(project_path: Path):
    """迁移单个项目"""
    outline_path = project_path / "outline.yml"
    if not outline_path.exists():
        return

    with open(outline_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if "style" in data and "style_type" not in data["style"]:
        prompt = data["style"]["prompt"]
        style_type, style_name = detect_style_type(prompt)

        if style_type:
            data["style"]["style_type"] = style_type.value
            data["style"]["style_name"] = style_name

            with open(outline_path, "w", encoding="utf-8") as f:
                yaml.dump(data, f, allow_unicode=True)

            print(f"✓ Migrated {project_path.name}: {style_name}")
        else:
            print(f"⊘ Skipped {project_path.name}: custom style")

def main():
    slides_dir = Path("./slides")
    for project_dir in slides_dir.iterdir():
        if project_dir.is_dir():
            migrate_project(project_dir)

if __name__ == "__main__":
    main()
```

---

## 5. 风险与挑战

### 5.1 技术风险

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 图像引擎不支持风格图片引导 | 风格一致性下降 | 将风格信息完整编码在 prompt 中 |
| 风格描述过长导致 token 超限 | 生成失败 | 设计精简版提示词，分离核心风格要素 |
| 向后兼容性问题 | 旧项目无法加载 | 所有新字段设为可选，读取时提供默认值 |

### 5.2 产品风险

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 用户不喜欢预设模板 | 使用率低 | 保留自定义风格选项，模板可编辑 |
| 模板描述不够准确 | 生成效果差 | 基于用户反馈持续优化模板描述 |
| 模板数量不足 | 限制创造力 | 设计可扩展架构，后续可添加更多模板 |

### 5.3 性能风险

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 风格描述过长增加生成时间 | 用户体验下降 | 优化提示词结构，移除冗余信息 |
| 频繁切换模板导致重复生成 | 成本增加 | 添加生成确认对话框，防止误操作 |

---

## 6. 后续优化方向

### 6.1 短期优化（1-2 周）

- [ ] 添加风格预览图（不生成，使用预先设计的示例图）
- [ ] 支持风格强度调节（滑块控制风格描述的权重）
- [ ] 优化风格描述的可读性（分段、格式化）
- [ ] 添加风格切换确认对话框（避免意外覆盖）

### 6.2 中期优化（1-2 月）

- [ ] 增加更多预设模板（如：扁平化设计、水墨画、科技感等）
- [ ] 支持风格混合（多个模板组合）
- [ ] 添加社区风格库（用户分享自定义风格）
- [ ] 风格效果对比工具（A/B 测试）

### 6.3 长期优化（3-6 月）

- [ ] AI 自动推荐风格（基于幻灯片内容）
- [ ] 风格学习功能（基于用户选择的图片训练风格模型）
- [ ] 多语言风格描述支持
- [ ] 风格版本管理（跟踪风格变更历史）

---

## 7. 文档与资源

### 7.1 相关文档

- [风格模板详细描述文档](./style-templates.md)（待创建）
- [图像生成 API 集成指南](./image-generation-integration.md)（现有）
- [项目数据结构规范](./project-data-structure.md)（现有）

### 7.2 参考资料

- **吉卜力风格**：[Studio Ghibli Art Style Guide](https://ghibli.fandom.com/)
- **迪士尼风格**：[Disney Animation Principles](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)
- **孟菲斯风格**：[Memphis Design Movement](https://en.wikipedia.org/wiki/Memphis_Group)
- **涂鸦艺术**：[Street Art and Graffiti Styles](https://en.wikipedia.org/wiki/Graffiti)

### 7.3 开发工具

- **后端测试**：pytest, pytest-asyncio
- **前端测试**：Vitest, React Testing Library
- **API 文档**：Swagger/OpenAPI
- **代码质量**：ESLint, Black, mypy

---

## 8. 附录

### 8.1 API 完整示例

#### 请求示例 1：获取风格模板

```bash
GET /api/style/templates
```

**响应**:

```json
{
  "templates": [
    {
      "type": "ghibli",
      "name": "吉卜力·治愈自然风",
      "name_en": "Studio Ghibli Style",
      "description": "手绘水彩质感背景，柔和渐变与细腻笔触...",
      "preview_prompt": "Studio Ghibli style, watercolor..."
    },
    {
      "type": "disney",
      "name": "迪士尼·魔法奇幻风",
      "name_en": "Disney Style",
      "description": "饱和明快色彩，夸张流畅的曲线造型...",
      "preview_prompt": "Disney animation style, vibrant colors..."
    },
    {
      "type": "memphis",
      "name": "孟菲斯·狂欢几何风",
      "name_en": "Memphis Style",
      "description": "高饱和撞色拼贴，随机几何图形...",
      "preview_prompt": "Memphis design style, bold geometric shapes..."
    },
    {
      "type": "graffiti",
      "name": "涂鸦·街头爆发风",
      "name_en": "Graffiti Style",
      "description": "粗糙质感底纹，喷漆晕染与滴落效果...",
      "preview_prompt": "Street graffiti art, spray paint texture..."
    }
  ]
}
```

#### 请求示例 2：基于模板生成风格候选

```bash
POST /api/slides/my-project-abc123/style/generate-from-template
Content-Type: application/json

{
  "style_type": "ghibli",
  "custom_prompt": "手绘水彩质感背景，柔和渐变..."  // 可选
}
```

**响应**:

```json
{
  "candidates": [
    {
      "id": "candidate-a1b2c3d4",
      "url": "/api/slides/my-project-abc123/style/candidates/candidate-a1b2c3d4.jpg"
    },
    {
      "id": "candidate-e5f6g7h8",
      "url": "/api/slides/my-project-abc123/style/candidates/candidate-e5f6g7h8.jpg"
    }
  ],
  "template": {
    "type": "ghibli",
    "name": "吉卜力·治愈自然风",
    "name_en": "Studio Ghibli Style",
    "description": "手绘水彩质感背景，柔和渐变...",
    "preview_prompt": "Studio Ghibli style, watercolor..."
  }
}
```

#### 请求示例 3：保存风格

```bash
PUT /api/slides/my-project-abc123/style
Content-Type: application/json

{
  "prompt": "手绘水彩质感背景，柔和渐变...",
  "candidate_id": "candidate-a1b2c3d4",
  "style_type": "ghibli",
  "style_name": "吉卜力·治愈自然风"
}
```

**响应**:

```json
{
  "style": {
    "prompt": "手绘水彩质感背景，柔和渐变...",
    "image": "style/style.jpg",
    "created_at": "2026-02-03T10:30:00.123456",
    "style_type": "ghibli",
    "style_name": "吉卜力·治愈自然风"
  }
}
```

### 8.2 数据结构完整示例

#### outline.yml 完整格式

```yaml
# 项目基本信息
title: "我的演示项目"
created_at: "2026-02-03T10:30:00.123456"
updated_at: "2026-02-03T11:45:30.789012"

# 🆕 风格信息（包含新字段）
style:
  prompt: |
    手绘水彩质感背景，柔和渐变与细腻笔触营造温暖氛围。
    天空云朵采用层叠晕染，自然景物（草地/树木/水面）精细描绘。
    色彩温润治愈：奶油白底（60%）、天空蓝/草地绿/暖阳黄...
  image: "style/style.jpg"
  created_at: "2026-02-03T10:35:00.123456"
  style_type: "ghibli"              # 🆕 风格类型
  style_name: "吉卜力·治愈自然风"   # 🆕 风格名称

# 幻灯片列表
slides:
  - sid: "slide-a1b2c3d4"
    content: |
      标题：欢迎来到我的演示

      要点：
      - 第一点内容
      - 第二点内容
      - 第三点内容
    created_at: "2026-02-03T10:40:00.123456"
    updated_at: "2026-02-03T10:45:00.123456"
    images:
      - hash: "abc123def456"
        path: "images/slide-a1b2c3d4/abc123def456.jpg"
        created_at: "2026-02-03T10:42:00.123456"
      - hash: "ghi789jkl012"
        path: "images/slide-a1b2c3d4/ghi789jkl012.jpg"
        created_at: "2026-02-03T10:44:00.123456"

# 成本信息
cost:
  estimated_cost: 0.24
  slide_generations: 10
  style_generations: 2
  total_images: 12

# 图像引擎配置
image_engine: "volcengine"  # 或 "gemini"
```

---

## 9. 审批与确认

### 9.1 设计审批

- [ ] **产品经理审批**：确认需求与功能设计
- [ ] **技术负责人审批**：确认技术方案与架构设计
- [ ] **UI/UX 设计师审批**：确认界面设计与交互流程

### 9.2 开发准备

- [ ] 技术方案评审通过
- [ ] 开发资源分配完成
- [ ] 依赖库和工具准备就绪
- [ ] 开发环境配置完成

---

**文档版本**: v1.0
**最后更新**: 2026-02-03
**作者**: Claude Code
**审批状态**: 待审批
