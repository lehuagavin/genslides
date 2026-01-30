# GenSlides Architecture Charts

## 1. Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React 19)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           COMPONENTS                                 │    │
│  ├──────────┬──────────┬──────────┬──────────┬──────────┬─────────────┤    │
│  │  Header  │ Sidebar  │ Preview  │  Player  │  Modals  │   common    │    │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┼─────────────┤    │
│  │ ・Logo   │ ・Slide  │ ・Main   │ ・Full   │ ・Style  │ ・Button    │    │
│  │ ・Title  │   List   │   Image  │   screen │   Setup  │ ・Modal     │    │
│  │ ・Style  │ ・Slide  │ ・Thumb  │   Player │ ・Style  │ ・Loading   │    │
│  │   Badge  │   Item   │   nails  │          │   Sett   │ ・Toast     │    │
│  │ ・Cost   │ ・Edit   │          │          │   ings   │ ・Input     │    │
│  │ ・Play   │   Modal  │          │          │          │ ・Textarea  │    │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴─────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         CUSTOM HOOKS                                 │    │
│  ├──────────┬──────────┬──────────┬──────────┬──────────┬─────────────┤    │
│  │useSlides │ useStyle │useImages │useWebSoc │useKeyboa │ useDebounce │    │
│  │          │          │          │   ket    │    rd    │             │    │
│  └────┬─────┴────┬─────┴────┬─────┴────┬─────┴──────────┴─────────────┘    │
│       │          │          │          │                                     │
│       ▼          ▼          ▼          ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      ZUSTAND STORES                                  │    │
│  ├───────────────┬───────────────┬───────────────┬─────────────────────┤    │
│  │  slidesStore  │  styleStore   │    uiStore    │    playerStore      │    │
│  ├───────────────┼───────────────┼───────────────┼─────────────────────┤    │
│  │ ・slides[]    │ ・style       │ ・toasts[]    │ ・isFullscreen      │    │
│  │ ・selectedSid │ ・candidates  │ ・generating  │ ・currentIndex      │    │
│  │ ・title       │ ・isGenerating│   Slides[]    │ ・isPlaying         │    │
│  │ ・cost        │ ・showModal   │               │                     │    │
│  │ ・isLoading   │               │               │                     │    │
│  └───────────────┴───────────────┴───────────────┴─────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          API CLIENT                                  │    │
│  ├────────────────┬────────────────┬────────────────┬──────────────────┤    │
│  │   client.ts    │   slides.ts    │   style.ts     │   images.ts      │    │
│  │   (HTTP)       │   (CRUD)       │   (Generate)   │   (Generate)     │    │
│  ├────────────────┴────────────────┴────────────────┴──────────────────┤    │
│  │                        websocket.ts (Real-time)                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Backend Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         API ROUTES                                   │    │
│  ├─────────────────┬─────────────────┬─────────────────┬───────────────┤    │
│  │   slides.py     │    style.py     │    images.py    │ websocket.py  │    │
│  ├─────────────────┼─────────────────┼─────────────────┼───────────────┤    │
│  │ GET  /slides    │ GET  /style     │ POST /generate  │ WS /ws/{slug} │    │
│  │ GET  /{slug}    │ POST /generate  │ GET  /images    │               │    │
│  │ DELETE /{slug}  │ PUT  /style     │                 │ ・Broadcast   │    │
│  │ PUT  /title     │                 │                 │ ・Ping/Pong   │    │
│  │ POST /{slug}    │                 │                 │               │    │
│  │ PUT  /{sid}     │                 │                 │               │    │
│  │ DELETE /{sid}   │                 │                 │               │    │
│  │ PUT  /reorder   │                 │                 │               │    │
│  └────────┬────────┴────────┬────────┴────────┬────────┴───────────────┘    │
│           │                 │                 │                              │
│           ▼                 ▼                 ▼                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          SERVICES                                    │    │
│  ├──────────────┬──────────────┬──────────────┬──────────────┬─────────┤    │
│  │SlidesService │ StyleService │ ImageService │GeminiService │CostServ │    │
│  ├──────────────┼──────────────┼──────────────┼──────────────┼─────────┤    │
│  │ ・get_project│ ・generate   │ ・generate   │ ・generate   │ ・calc  │    │
│  │ ・delete     │   _candidates│   _image     │   _slide     │   _cost │    │
│  │   _project   │ ・save_style │ ・save_image │   _image     │ ・get   │    │
│  │ ・update     │              │ ・get_images │ ・generate   │   _break│    │
│  │   _title     │              │              │   _style     │   down  │    │
│  │ ・create     │              │              │              │         │    │
│  │   _slide     │              │              │              │         │    │
│  │ ・reorder    │              │              │              │         │    │
│  └──────┬───────┴──────┬───────┴──────┬───────┴──────────────┴─────────┘    │
│         │              │              │                                      │
│         ▼              ▼              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        REPOSITORIES                                  │    │
│  ├──────────────────┬──────────────────┬───────────────────────────────┤    │
│  │ SlidesRepository │ StyleRepository  │     ImageRepository           │    │
│  ├──────────────────┼──────────────────┼───────────────────────────────┤    │
│  │ ・get_project    │ ・get_style      │ ・save_image                  │    │
│  │ ・save_project   │ ・save_style     │ ・save_thumbnail              │    │
│  │ ・delete_project │ ・save_candidate │ ・get_images                  │    │
│  │ ・list_projects  │                  │ ・file_exists                 │    │
│  └──────────────────┴──────────────────┴───────────────────────────────┘    │
│                                │                                             │
│                                ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       DATA MODELS                                    │    │
│  ├──────────────┬──────────────┬──────────────┬──────────────┬─────────┤    │
│  │   Project    │    Slide     │  SlideImage  │    Style     │CostInfo │    │
│  └──────────────┴──────────────┴──────────────┴──────────────┴─────────┘    │
│                                │                                             │
│                                ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      FILE SYSTEM                                     │    │
│  │   ./slides/{slug}/                                                   │    │
│  │   ├── outline.yml          (Project metadata + slides)               │    │
│  │   ├── style/main.jpg       (Selected style image)                    │    │
│  │   └── images/{sid}/        (Generated slide images)                  │    │
│  │       ├── {hash}.jpg                                                 │    │
│  │       └── {hash}_thumb.jpg                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW                                         │
└─────────────────────────────────────────────────────────────────────────────┘

                           ┌─────────────────┐
                           │      USER       │
                           └────────┬────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Edit Slide   │         │ Generate Image  │         │  Select Style   │
│   Content     │         │                 │         │                 │
└───────┬───────┘         └────────┬────────┘         └────────┬────────┘
        │                          │                           │
        ▼                          ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Debounce     │         │ POST /generate  │         │ POST /style     │
│  (500ms)      │         │                 │         │    /generate    │
└───────┬───────┘         └────────┬────────┘         └────────┬────────┘
        │                          │                           │
        ▼                          ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│Zustand Store  │         │Return task_id   │         │ Return 3        │
│Optimistic Upd │         │immediately      │         │ candidates      │
└───────┬───────┘         └────────┬────────┘         └────────┬────────┘
        │                          │                           │
        ▼                          ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│PUT /{slug}    │         │ Background Task │         │ Display Options │
│     /{sid}    │         │   (Gemini AI)   │         │ in Modal        │
└───────┬───────┘         └────────┬────────┘         └────────┬────────┘
        │                          │                           │
        ▼                          ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│SlidesService  │         │ Generate Image  │         │ User Selects    │
│.update_slide  │         │ + Thumbnail     │         │ One Style       │
└───────┬───────┘         └────────┬────────┘         └────────┬────────┘
        │                          │                           │
        ▼                          ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│SlidesRepo     │         │ Save to         │         │PUT /style       │
│.save_project  │         │ FileSystem      │         │                 │
└───────┬───────┘         └────────┬────────┘         └────────┬────────┘
        │                          │                           │
        ▼                          ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ outline.yml   │         │ WebSocket       │         │ Save Style      │
│ Updated       │         │ Broadcast       │         │ + Update YAML   │
└───────────────┘         └────────┬────────┘         └─────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Frontend        │
                          │ WebSocket       │
                          │ Handler         │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ useSlidesStore  │
                          │.updateSlideImage│
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ UI Re-renders   │
                          │ with New Image  │
                          └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                        WEBSOCKET MESSAGE TYPES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   generation_started     ─────►  Show loading spinner on slide              │
│   generation_completed   ─────►  Update slide image in store                │
│   generation_failed      ─────►  Show error toast                           │
│   cost_updated           ─────►  Update cost display                        │
│   style_generation_completed ──► Update style in store                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Frontend Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND TECHNOLOGY STACK                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CORE                                            │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│      React 19        │    TypeScript 5.9    │         Vite 6.x              │
│   ┌────────────┐     │   ┌────────────┐     │   ┌────────────────────┐      │
│   │ Functional │     │   │ Strict     │     │   │ Fast HMR           │      │
│   │ Components │     │   │ Type       │     │   │ ES Modules         │      │
│   │ Hooks      │     │   │ Checking   │     │   │ Dev Server Proxy   │      │
│   └────────────┘     │   └────────────┘     │   └────────────────────┘      │
└──────────────────────┴──────────────────────┴───────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                              Zustand                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  ・Minimal boilerplate                                               │   │
│   │  ・No providers needed                                               │   │
│   │  ・TypeScript-first                                                  │   │
│   │  ・Efficient re-renders with selectors                               │   │
│   │  ・Devtools support                                                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             STYLING                                          │
├──────────────────────────────────────┬──────────────────────────────────────┤
│          Tailwind CSS 4.x            │        Custom Design Tokens          │
│   ┌─────────────────────────────┐    │   ┌──────────────────────────────┐   │
│   │ ・Utility-first CSS         │    │   │ ・--md-ink (text)            │   │
│   │ ・JIT compilation           │    │   │ ・--md-sky (primary)         │   │
│   │ ・Responsive design         │    │   │ ・--md-watermelon (danger)   │   │
│   │ ・Dark mode support         │    │   │ ・--md-cream (background)    │   │
│   └─────────────────────────────┘    │   └──────────────────────────────┘   │
└──────────────────────────────────────┴──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMMUNICATION                                      │
├──────────────────────────────────────┬──────────────────────────────────────┤
│           HTTP (Fetch API)           │           WebSocket                   │
│   ┌─────────────────────────────┐    │   ┌──────────────────────────────┐   │
│   │ ・Custom api client         │    │   │ ・Real-time updates          │   │
│   │ ・JSON request/response     │    │   │ ・Auto-reconnect             │   │
│   │ ・Error handling            │    │   │ ・Ping/pong keep-alive       │   │
│   │ ・Type-safe responses       │    │   │ ・Message handlers           │   │
│   └─────────────────────────────┘    │   └──────────────────────────────┘   │
└──────────────────────────────────────┴──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           UTILITIES                                          │
├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│    clsx/twMerge  │  Custom Hooks    │     Logger       │   Path Aliases     │
│   ┌──────────┐   │   ┌──────────┐   │   ┌──────────┐   │   ┌────────────┐   │
│   │ Class    │   │   │useDebounce│  │   │ Dev-only │   │   │ @/ = src/  │   │
│   │ merging  │   │   │useKeyboard│  │   │ logging  │   │   │            │   │
│   └──────────┘   │   └──────────┘   │   └──────────┘   │   └────────────┘   │
└──────────────────┴──────────────────┴──────────────────┴────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROJECT STRUCTURE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   src/                                                                       │
│   ├── components/          Feature-based component organization             │
│   │   ├── Header/          Logo, TitleInput, StyleBadge, CostDisplay        │
│   │   ├── Sidebar/         SlideList, SlideItem, SlideEditModal             │
│   │   ├── Preview/         MainImage, ThumbnailList                         │
│   │   ├── Player/          FullscreenPlayer                                 │
│   │   ├── Modals/          StyleSetupModal, StyleSettingsModal              │
│   │   ├── HomePage/        HomePage                                         │
│   │   └── common/          Button, Modal, Toast, Loading, Input             │
│   ├── stores/              Zustand stores (slides, style, ui, player)       │
│   ├── hooks/               Custom React hooks                               │
│   ├── api/                 HTTP & WebSocket clients                         │
│   ├── types/               TypeScript type definitions                      │
│   ├── utils/               Utility functions (cn, logger, format)           │
│   ├── styles/              Global CSS & design tokens                       │
│   ├── App.tsx              Root component with routing                      │
│   ├── ProjectEditor.tsx    Main editor component                            │
│   └── main.tsx             Application entry point                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5. Backend Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND TECHNOLOGY STACK                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CORE                                            │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│     Python 3.12+     │       FastAPI        │        Uvicorn                │
│   ┌────────────┐     │   ┌────────────┐     │   ┌────────────────────┐      │
│   │ Async/Await│     │   │ OpenAPI    │     │   │ ASGI Server        │      │
│   │ Type Hints │     │   │ Auto-docs  │     │   │ Hot Reload         │      │
│   │ Dataclasses│     │   │ Dependency │     │   │ uvloop             │      │
│   │            │     │   │ Injection  │     │   │                    │      │
│   └────────────┘     │   └────────────┘     │   └────────────────────┘      │
└──────────────────────┴──────────────────────┴───────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA VALIDATION                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                             Pydantic v2                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  ・Request/Response schema validation                                │   │
│   │  ・Automatic JSON serialization                                      │   │
│   │  ・Field constraints (min_length, max_length)                        │   │
│   │  ・Settings management (pydantic-settings)                           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          AI INTEGRATION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                    Google Generative AI (Gemini)                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  ・Image generation for slides                                       │   │
│   │  ・Style candidate generation                                        │   │
│   │  ・Async API calls                                                   │   │
│   │  ・Cost tracking per generation                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE                                     │
├──────────────────────────────────────┬──────────────────────────────────────┤
│             YAML Files               │           File System                 │
│   ┌─────────────────────────────┐    │   ┌──────────────────────────────┐   │
│   │ ・Project metadata          │    │   │ ・Generated images (.jpg)    │   │
│   │ ・Slide content             │    │   │ ・Thumbnails                 │   │
│   │ ・Style configuration       │    │   │ ・Style images               │   │
│   │ ・Cost tracking             │    │   │ ・Async I/O (aiofiles)       │   │
│   └─────────────────────────────┘    │   └──────────────────────────────┘   │
└──────────────────────────────────────┴──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          REAL-TIME                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                           WebSocket                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  ・ConnectionManager for per-project connections                     │   │
│   │  ・Broadcast messages to all connected clients                       │   │
│   │  ・Event types: generation_started, generation_completed, etc.       │   │
│   │  ・Automatic cleanup on disconnect                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONCURRENCY                                          │
├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│   AsyncIO Lock   │ BackgroundTasks  │    aiofiles      │       PIL          │
│   ┌──────────┐   │   ┌──────────┐   │   ┌──────────┐   │   ┌────────────┐   │
│   │ Per-slug │   │   │ Image    │   │   │ Async    │   │   │ Thumbnail  │   │
│   │ file     │   │   │ generation│  │   │ file I/O │   │   │ generation │   │
│   │ locking  │   │   │ tasks    │   │   │          │   │   │            │   │
│   └──────────┘   │   └──────────┘   │   └──────────┘   │   └────────────┘   │
└──────────────────┴──────────────────┴──────────────────┴────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         UTILITIES                                            │
├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│     BLAKE3       │      PyYAML      │    Logging       │   CORS Middleware  │
│   ┌──────────┐   │   ┌──────────┐   │   ┌──────────┐   │   ┌────────────┐   │
│   │ Content  │   │   │ Project  │   │   │ Structured│  │   │ Cross-origin│  │
│   │ hashing  │   │   │ serialize│   │   │ logging  │   │   │ requests   │   │
│   └──────────┘   │   └──────────┘   │   └──────────┘   │   └────────────┘   │
└──────────────────┴──────────────────┴──────────────────┴────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROJECT STRUCTURE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   app/                                                                       │
│   ├── main.py              FastAPI app, middleware, lifespan                │
│   ├── config.py            Settings via pydantic-settings                  │
│   ├── exceptions.py        Custom exception hierarchy                       │
│   │                                                                          │
│   ├── api/                 HTTP Layer                                       │
│   │   ├── routes/          Route handlers (slides, style, images, ws)       │
│   │   ├── schemas/         Pydantic request/response models                 │
│   │   └── dependencies.py  FastAPI dependency injection                     │
│   │                                                                          │
│   ├── services/            Business Logic Layer                             │
│   │   ├── slides_service   Project/slide CRUD                               │
│   │   ├── style_service    Style generation workflow                        │
│   │   ├── image_service    Image generation & management                    │
│   │   ├── gemini_service   Google AI API calls                              │
│   │   └── cost_service     Cost calculation                                 │
│   │                                                                          │
│   ├── repositories/        Data Access Layer                                │
│   │   ├── slides_repo      YAML file operations                             │
│   │   ├── style_repo       Style file management                            │
│   │   └── image_repo       Image file management                            │
│   │                                                                          │
│   ├── models/              Domain Models (dataclasses)                      │
│   │   ├── project.py       Project, CostInfo                                │
│   │   ├── slide.py         Slide, SlideImage                                │
│   │   └── style.py         Style                                            │
│   │                                                                          │
│   └── utils/               Utilities                                        │
│       ├── hash.py          Content hash computation                         │
│       └── file.py          File I/O helpers, is_safe_name                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           API ENDPOINTS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   /api/slides                                                                │
│   ├── GET    /                    List all projects                         │
│   ├── GET    /{slug}              Get/create project                        │
│   ├── DELETE /{slug}              Delete project                            │
│   ├── PUT    /{slug}/title        Update title                              │
│   ├── POST   /{slug}              Create slide                              │
│   ├── PUT    /{slug}/{sid}        Update slide content                      │
│   ├── DELETE /{slug}/{sid}        Delete slide                              │
│   ├── PUT    /{slug}/reorder      Reorder slides                            │
│   └── GET    /{slug}/cost         Get cost info                             │
│                                                                              │
│   /api/slides/{slug}/{sid}                                                   │
│   ├── POST   /generate            Generate image (async)                    │
│   └── GET    /images              Get all slide images                      │
│                                                                              │
│   /api/slides/{slug}/style                                                   │
│   ├── GET    /                    Get current style                         │
│   ├── POST   /generate            Generate style candidates                 │
│   └── PUT    /                    Save selected style                       │
│                                                                              │
│   /ws/slides/{slug}               WebSocket for real-time updates           │
│                                                                              │
│   /static/slides/{slug}/...       Static file serving (images)              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
