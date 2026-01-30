# GenSlides

AI-powered presentation slide generator using Google Gemini for image generation.

## Features

- **AI Image Generation**: Generate slide images from text content using Gemini
- **Style System**: Define a visual style once, apply it consistently across all slides
- **Real-time Updates**: WebSocket-based live updates for generation progress
- **Cost Tracking**: Track API usage and estimated costs
- **Fullscreen Presentation**: Built-in presentation mode

## Tech Stack

### Backend
- **Python 3.12+** with FastAPI
- **uv** for dependency management
- **Google Gemini** for image generation
- **YAML** for data storage
- **WebSocket** for real-time updates

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- Google Gemini API key

### Backend Setup

```bash
cd backend

# Install dependencies with uv
uv sync --all-extras

# Copy environment config
cp ../.env.example ../.env

# Edit .env and add your GEMINI_API_KEY

# Run development server
uv run uvicorn app.main:app --reload --port 3003
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
```

### Access the Application

Open http://localhost:5173/slides/demo in your browser.

## Project Structure

```
genslides/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes and schemas
│   │   ├── models/         # Domain models
│   │   ├── repositories/   # Data access layer
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── tests/              # Backend tests
│
├── frontend/               # React TypeScript frontend
│   └── src/
│       ├── api/           # API client
│       ├── components/    # React components
│       ├── hooks/         # Custom hooks
│       ├── stores/        # Zustand state
│       ├── types/         # TypeScript types
│       └── utils/         # Utility functions
│
├── slides/                # Data storage (generated)
└── .env                   # Environment config
```

## API Endpoints

### Slides
- `GET /api/slides/{slug}` - Get project info
- `PUT /api/slides/{slug}/title` - Update title
- `POST /api/slides/{slug}` - Create slide
- `PUT /api/slides/{slug}/{sid}` - Update slide
- `DELETE /api/slides/{slug}/{sid}` - Delete slide

### Style
- `GET /api/slides/{slug}/style` - Get current style
- `POST /api/slides/{slug}/style/generate` - Generate style candidates
- `PUT /api/slides/{slug}/style` - Save selected style

### Images
- `GET /api/slides/{slug}/{sid}/images` - Get slide images
- `POST /api/slides/{slug}/{sid}/generate` - Generate image

### WebSocket
- `WS /ws/slides/{slug}` - Real-time updates

## Development

### Run Tests

```bash
# Backend
cd backend
uv run pytest

# Frontend
cd frontend
npm run test
```

### Lint and Format

```bash
# Backend
cd backend
uv run ruff check . --fix
uv run ruff format .

# Frontend
cd frontend
npm run lint
```

## License

MIT
