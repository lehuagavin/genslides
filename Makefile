.PHONY: help build deploy restart stop logs status clean ps

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default service (empty means all services)
SERVICE ?=

# Validate SERVICE if provided
ifneq ($(SERVICE),)
    ifneq ($(filter $(SERVICE),frontend backend),$(SERVICE))
        $(error Invalid SERVICE value. Use: frontend, backend, or leave empty for all services)
    endif
endif

# Docker compose command with current user UID/GID for file permissions
export UID := $(shell id -u)
export GID := $(shell id -g)
COMPOSE := docker compose

help: ## Show this help message
	@echo "$(BLUE)GenSlides Docker Management$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(GREEN)Optional parameters:$(NC)"
	@echo "  SERVICE=frontend|backend  - Target a specific service (default: all)"
	@echo ""
	@echo "$(GREEN)Examples:$(NC)"
	@echo "  make deploy                 # Deploy all services"
	@echo "  make deploy SERVICE=backend # Deploy only backend"
	@echo "  make logs SERVICE=frontend  # View frontend logs"
	@echo "  make restart SERVICE=backend # Restart backend only"
	@echo ""

build: ## Build or rebuild services
	@echo "$(BLUE)Building services...$(NC)"
ifdef SERVICE
	@echo "$(YELLOW)Target: $(SERVICE)$(NC)"
	$(COMPOSE) build $(SERVICE)
else
	@echo "$(YELLOW)Target: all services$(NC)"
	$(COMPOSE) build
endif
	@echo "$(GREEN)✓ Build complete$(NC)"

deploy: ## Rebuild and deploy services (down, build, up)
	@echo "$(BLUE)Deploying services...$(NC)"
ifdef SERVICE
	@echo "$(YELLOW)Target: $(SERVICE)$(NC)"
	$(COMPOSE) stop $(SERVICE)
	$(COMPOSE) rm -f $(SERVICE)
	$(COMPOSE) build $(SERVICE)
	$(COMPOSE) up -d $(SERVICE)
else
	@echo "$(YELLOW)Target: all services$(NC)"
	$(COMPOSE) down
	$(COMPOSE) build
	$(COMPOSE) up -d
endif
	@echo "$(GREEN)✓ Deployment complete$(NC)"
	@$(MAKE) --no-print-directory status

restart: ## Restart services
	@echo "$(BLUE)Restarting services...$(NC)"
ifdef SERVICE
	@echo "$(YELLOW)Target: $(SERVICE)$(NC)"
	$(COMPOSE) restart $(SERVICE)
else
	@echo "$(YELLOW)Target: all services$(NC)"
	$(COMPOSE) restart
endif
	@echo "$(GREEN)✓ Restart complete$(NC)"
	@$(MAKE) --no-print-directory status

stop: ## Stop services
	@echo "$(BLUE)Stopping services...$(NC)"
ifdef SERVICE
	@echo "$(YELLOW)Target: $(SERVICE)$(NC)"
	$(COMPOSE) stop $(SERVICE)
else
	@echo "$(YELLOW)Target: all services$(NC)"
	$(COMPOSE) stop
endif
	@echo "$(GREEN)✓ Services stopped$(NC)"

start: ## Start services
	@echo "$(BLUE)Starting services...$(NC)"
ifdef SERVICE
	@echo "$(YELLOW)Target: $(SERVICE)$(NC)"
	$(COMPOSE) start $(SERVICE)
else
	@echo "$(YELLOW)Target: all services$(NC)"
	$(COMPOSE) start
endif
	@echo "$(GREEN)✓ Services started$(NC)"
	@$(MAKE) --no-print-directory status

up: ## Create and start services
	@echo "$(BLUE)Starting services...$(NC)"
ifdef SERVICE
	@echo "$(YELLOW)Target: $(SERVICE)$(NC)"
	$(COMPOSE) up -d $(SERVICE)
else
	@echo "$(YELLOW)Target: all services$(NC)"
	$(COMPOSE) up -d
endif
	@echo "$(GREEN)✓ Services started$(NC)"
	@$(MAKE) --no-print-directory status

down: ## Stop and remove services
	@echo "$(BLUE)Stopping and removing services...$(NC)"
	$(COMPOSE) down
	@echo "$(GREEN)✓ Services removed$(NC)"

logs: ## View service logs (use SERVICE= to specify)
ifdef SERVICE
	@echo "$(BLUE)Viewing logs for: $(SERVICE)$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to exit$(NC)"
	@$(COMPOSE) logs -f $(SERVICE)
else
	@echo "$(BLUE)Viewing logs for: all services$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to exit$(NC)"
	@$(COMPOSE) logs -f
endif

status: ## Show service status
	@echo "$(BLUE)Service Status:$(NC)"
	@echo ""
	@$(COMPOSE) ps
	@echo ""

ps: status ## Alias for status

clean: ## Remove all containers, volumes, and images
	@echo "$(RED)Warning: This will remove all containers, volumes, and images$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BLUE)Cleaning up...$(NC)"; \
		$(COMPOSE) down -v --rmi all; \
		echo "$(GREEN)✓ Cleanup complete$(NC)"; \
	else \
		echo "$(YELLOW)Cleanup cancelled$(NC)"; \
	fi

health: ## Check health status of services
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend Health:$(NC)"
	@curl -s http://localhost:3003/health || echo "$(RED)✗ Backend is not responding$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend Health:$(NC)"
	@curl -s http://localhost/health || echo "$(RED)✗ Frontend is not responding$(NC)"
	@echo ""

shell-backend: ## Open shell in backend container
	@$(COMPOSE) exec backend /bin/bash

shell-frontend: ## Open shell in frontend container
	@$(COMPOSE) exec frontend /bin/sh

dev: ## Start services in development mode with logs
	@echo "$(BLUE)Starting in development mode...$(NC)"
	$(COMPOSE) up --build

prod: deploy ## Alias for deploy (production deployment)
