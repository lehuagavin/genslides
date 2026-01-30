# Docker Deployment Guide

This guide explains how to deploy GenSlides using Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- Make (optional, for convenience commands)

## Quick Start

1. **Configure environment variables**

   Copy the example environment file and configure your API keys:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your API keys
   ```

2. **Deploy all services**

   ```bash
   make deploy
   ```

   Or without Make:
   ```bash
   docker compose up -d --build
   ```

3. **Access the application**

   - Frontend: http://localhost
   - Backend API: http://localhost:3003

## Makefile Commands

### Main Commands

| Command | Description | Example |
|---------|-------------|---------|
| `make help` | Show all available commands | `make help` |
| `make deploy` | Rebuild and deploy services | `make deploy` |
| `make build` | Build or rebuild services | `make build` |
| `make restart` | Restart services | `make restart` |
| `make logs` | View service logs | `make logs` |
| `make status` | Show service status | `make status` |

### Service-Specific Operations

All commands support the optional `SERVICE` parameter to target a specific service:

```bash
# Deploy only backend
make deploy SERVICE=backend

# Restart only frontend
make restart SERVICE=frontend

# View backend logs
make logs SERVICE=backend

# Build only frontend
make build SERVICE=frontend
```

### Additional Commands

| Command | Description |
|---------|-------------|
| `make start` | Start stopped services |
| `make stop` | Stop running services |
| `make up` | Create and start services |
| `make down` | Stop and remove services |
| `make health` | Check service health |
| `make ps` | Show service status (alias for status) |
| `make clean` | Remove all containers, volumes, and images |
| `make shell-backend` | Open shell in backend container |
| `make shell-frontend` | Open shell in frontend container |
| `make dev` | Start in development mode with logs |

## Architecture

### Services

- **backend**: FastAPI application running on port 3003
- **frontend**: React application served by Nginx on port 80

### Network

Services communicate through a Docker bridge network named `genslides-network`.

### Volumes

- `./slides`: Persisted slides data directory (mounted to backend)

### Health Checks

Both services have health checks configured:
- **Backend**: HTTP check on `/health` endpoint
- **Frontend**: HTTP check on `/health` endpoint

## Environment Variables

The following environment variables can be configured in `.env`:

```bash
# VolcEngine Ark API (Default engine)
ARK_API_KEY=your_ark_api_key_here

# Google Gemini API (Alternative engine)
GEMINI_API_KEY=your_api_key_here

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=3003

# Data Storage
SLIDES_BASE_PATH=./slides

# CORS Configuration
CORS_ORIGINS=http://localhost:5173
```

## Production Deployment

### 1. Update Environment Variables

Ensure all API keys are properly configured in `.env`.

### 2. Configure CORS

Update `CORS_ORIGINS` in `docker-compose.yml` to match your production domain:

```yaml
environment:
  - CORS_ORIGINS=https://yourdomain.com
```

### 3. Use Production Build

The frontend Dockerfile uses multi-stage builds for optimized production images.

### 4. Enable HTTPS

For production, consider adding an SSL/TLS termination proxy:

```yaml
services:
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./nginx-proxy.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
```

### 5. Deploy

```bash
make deploy
```

## Monitoring and Maintenance

### View Logs

```bash
# All services
make logs

# Specific service
make logs SERVICE=backend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Check Service Status

```bash
make status
```

### Health Check

```bash
make health
```

### Restart Services

```bash
# All services
make restart

# Specific service
make restart SERVICE=backend
```

## Troubleshooting

### Services won't start

1. Check logs:
   ```bash
   make logs
   ```

2. Verify environment variables:
   ```bash
   cat .env
   ```

3. Check Docker resources:
   ```bash
   docker system df
   ```

### Backend connection issues

1. Check if backend is healthy:
   ```bash
   curl http://localhost:3003/health
   ```

2. Check backend logs:
   ```bash
   make logs SERVICE=backend
   ```

### Frontend can't connect to backend

1. Verify network connectivity:
   ```bash
   docker compose exec frontend ping backend
   ```

2. Check nginx configuration:
   ```bash
   docker compose exec frontend cat /etc/nginx/conf.d/default.conf
   ```

### Data persistence issues

Ensure the `slides` directory has proper permissions:
```bash
sudo chown -R 1000:1000 ./slides
```

## Cleanup

### Remove all services and data

```bash
make clean
```

This will:
- Stop all containers
- Remove containers
- Remove volumes (⚠️ data will be lost)
- Remove images

### Remove services but keep data

```bash
make down
```

## Development

### Development Mode

Start services with live logs:

```bash
make dev
```

### Mount Source Code

For development, you can mount source code as volumes. Uncomment in `docker-compose.yml`:

```yaml
backend:
  volumes:
    - ./backend/app:/app/app
```

Then restart:

```bash
make restart SERVICE=backend
```

## Backup and Restore

### Backup slides data

```bash
tar -czf slides-backup-$(date +%Y%m%d).tar.gz slides/
```

### Restore slides data

```bash
tar -xzf slides-backup-YYYYMMDD.tar.gz
```

## Updates

To update to the latest version:

```bash
git pull
make deploy
```

## Support

For issues and questions, please check:
- Project README: [README.md](./README.md)
- GitHub Issues: [Create an issue](https://github.com/yourusername/genslides/issues)
