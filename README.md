# GenSlides

AI-powered presentation slide generator with support for multiple image generation engines.

## Features

- **AI Image Generation**: Generate slide images from text content using VolcEngine or Google Gemini
- **Style System**: Define a visual style once, apply it consistently across all slides
- **Real-time Updates**: WebSocket-based live updates for generation progress
- **Cost Tracking**: Track API usage and estimated costs
- **Fullscreen Presentation**: Built-in presentation mode
- **Docker Support**: One-command deployment with Docker Compose
- **Watermark-Free**: Generated images without AI watermarks

## Tech Stack

### Backend
- **Python 3.12+** with FastAPI
- **uv** for dependency management
- **VolcEngine Ark API** (default) or **Google Gemini** for image generation
- **YAML** for data storage
- **WebSocket** for real-time updates

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management

## Getting Started

### Quick Start with Docker (Recommended)

The easiest way to run GenSlides is using Docker Compose:

```bash
# 1. Copy and configure environment variables
cp .env.example .env
nano .env  # Add your API keys

# 2. Deploy with one command
make deploy

# 3. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3003
```

For detailed Docker deployment instructions, see [DOCKER.md](./DOCKER.md).

### Manual Setup

#### Prerequisites

- Python 3.12+
- Node.js 20+
- VolcEngine Ark API key (recommended) or Google Gemini API key

### Backend Setup

```bash
cd backend

# Install dependencies with uv
uv sync --all-extras

# Copy environment config
cp ../.env.example ../.env

# Edit .env and add your API key:
# - ARK_API_KEY for VolcEngine (default engine)
# - GEMINI_API_KEY for Google Gemini (optional)

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

- **With Docker**: Open http://localhost:5173 in your browser
- **Development**: Open http://localhost:5173 in your browser
- **Backend API**: http://localhost:3003/docs (Swagger UI)

## Docker Deployment

GenSlides supports Docker Compose for easy deployment. See [DOCKER.md](./DOCKER.md) for complete documentation.

### Quick Commands

```bash
# Deployment
make deploy                    # Deploy all services
make deploy SERVICE=backend    # Deploy backend only
make deploy SERVICE=frontend   # Deploy frontend only

# Service Management
make restart                   # Restart all services
make restart SERVICE=backend   # Restart backend only
make status                    # Check service status
make health                    # Check service health

# Logs and Debugging
make logs                      # View all logs
make logs SERVICE=backend      # View backend logs
make shell-backend             # Access backend shell
make shell-frontend            # Access frontend shell

# Maintenance
make clean                     # Stop and remove containers
make build                     # Build images only
make help                      # Show all commands
```

### Environment Configuration

Create a `.env` file in the project root:

```bash
# Required: At least one API key
ARK_API_KEY=your_volcengine_ark_api_key
GEMINI_API_KEY=your_google_gemini_api_key

# Optional: Default engine (volcengine or gemini)
DEFAULT_ENGINE=volcengine
```

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

## Troubleshooting

### Docker Issues

**Frontend not starting:**
```bash
# Check logs
make logs SERVICE=frontend

# Rebuild frontend
make build SERVICE=frontend
make restart SERVICE=frontend
```

**Backend health check failing:**
```bash
# Verify API key is set
docker exec genslides-backend env | grep ARK_API_KEY

# Check backend logs
make logs SERVICE=backend
```

**Port conflicts:**
```bash
# Check if ports 3003 or 5173 are already in use
lsof -i :3003
lsof -i :5173

# Modify ports in docker-compose.yml if needed
```

### Development Issues

**TypeScript errors:**
```bash
cd frontend
npm run typecheck
```

**Backend dependencies:**
```bash
cd backend
uv sync --all-extras
```

**WebSocket connection issues:**
- Ensure backend is running on port 3003
- Check browser console for connection errors
- Verify nginx proxy configuration in `frontend/nginx.conf`

## License

MIT
