#!/bin/bash

# GenSlides Quick Start Script
# This script helps you set up and deploy GenSlides with Docker

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

print_header() {
    echo ""
    print_message "$BLUE" "========================================"
    print_message "$BLUE" "$1"
    print_message "$BLUE" "========================================"
    echo ""
}

print_success() {
    print_message "$GREEN" "✓ $1"
}

print_warning() {
    print_message "$YELLOW" "⚠ $1"
}

print_error() {
    print_message "$RED" "✗ $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    local all_good=true

    if command_exists docker; then
        print_success "Docker is installed"
        docker --version
    else
        print_error "Docker is not installed"
        print_warning "Please install Docker: https://docs.docker.com/get-docker/"
        all_good=false
    fi

    if command_exists docker compose; then
        print_success "Docker Compose is installed"
        docker compose version
    else
        print_error "Docker Compose V2 is not installed"
        print_warning "Please install Docker Compose: https://docs.docker.com/compose/install/"
        all_good=false
    fi

    if command_exists make; then
        print_success "Make is installed"
    else
        print_warning "Make is not installed (optional but recommended)"
        print_message "$YELLOW" "You can still use docker compose commands directly"
    fi

    if [ "$all_good" = false ]; then
        print_error "Prerequisites check failed"
        exit 1
    fi

    print_success "All prerequisites satisfied"
}

# Setup environment
setup_environment() {
    print_header "Setting Up Environment"

    if [ -f .env ]; then
        print_warning ".env file already exists"
        read -p "Do you want to overwrite it? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_message "$YELLOW" "Keeping existing .env file"
            return
        fi
    fi

    if [ ! -f .env.example ]; then
        print_error ".env.example not found"
        exit 1
    fi

    cp .env.example .env
    print_success "Created .env file from template"

    echo ""
    print_message "$YELLOW" "Please edit .env and add your API keys:"
    print_message "$YELLOW" "  - ARK_API_KEY (VolcEngine - recommended)"
    print_message "$YELLOW" "  - GEMINI_API_KEY (Google Gemini - optional)"
    echo ""

    read -p "Press Enter to open .env in editor, or Ctrl+C to edit manually..."

    if command_exists nano; then
        nano .env
    elif command_exists vim; then
        vim .env
    elif command_exists vi; then
        vi .env
    else
        print_warning "No text editor found. Please edit .env manually."
    fi
}

# Create necessary directories
setup_directories() {
    print_header "Creating Directories"

    mkdir -p slides
    print_success "Created slides directory"
}

# Deploy services
deploy_services() {
    print_header "Deploying Services"

    if command_exists make; then
        make deploy
    else
        print_message "$YELLOW" "Using docker compose directly..."
        docker compose down
        docker compose build
        docker compose up -d
    fi

    print_success "Services deployed"
}

# Check service health
check_health() {
    print_header "Checking Service Health"

    print_message "$YELLOW" "Waiting for services to start..."
    sleep 5

    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -sf http://localhost:3003/health > /dev/null 2>&1; then
            print_success "Backend is healthy"
            break
        fi

        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            print_error "Backend health check failed"
            print_warning "Check logs with: make logs SERVICE=backend"
            return 1
        fi

        sleep 2
    done

    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf http://localhost/health > /dev/null 2>&1; then
            print_success "Frontend is healthy"
            break
        fi

        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            print_error "Frontend health check failed"
            print_warning "Check logs with: make logs SERVICE=frontend"
            return 1
        fi

        sleep 2
    done
}

# Show final instructions
show_instructions() {
    print_header "Setup Complete! 🎉"

    echo ""
    print_success "GenSlides is now running!"
    echo ""
    print_message "$GREEN" "Access the application:"
    print_message "$GREEN" "  Frontend:  http://localhost"
    print_message "$GREEN" "  Backend:   http://localhost:3003"
    echo ""
    print_message "$BLUE" "Useful commands:"
    print_message "$BLUE" "  make logs          - View logs"
    print_message "$BLUE" "  make status        - Check service status"
    print_message "$BLUE" "  make restart       - Restart services"
    print_message "$BLUE" "  make stop          - Stop services"
    print_message "$BLUE" "  make help          - Show all commands"
    echo ""
    print_message "$YELLOW" "For more information, see DOCKER.md"
    echo ""
}

# Main function
main() {
    print_header "GenSlides Quick Start"

    check_prerequisites
    setup_environment
    setup_directories
    deploy_services
    check_health
    show_instructions
}

# Run main function
main
