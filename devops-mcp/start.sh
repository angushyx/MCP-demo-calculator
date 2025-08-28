#!/bin/bash

# 快速啟動腳本
# 用法: ./start.sh [dev|docker|install]

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

function print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

function print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

function install_dependencies() {
    print_info "Installing dependencies..."
    
    # Install devops-mcp
    if [ -d "devops-mcp" ]; then
        print_info "Installing devops-mcp..."
        cd devops-mcp
        npm install
        npm run build
        cd ..
    fi
    
    # Install slack-mcp
    if [ -d "slack-mcp" ]; then
        print_info "Installing slack-mcp..."
        cd slack-mcp
        npm install
        npm run build
        cd ..
    fi
    
    # Install backend
    if [ -d "backend" ]; then
        print_info "Installing backend..."
        cd backend
        if [ ! -f ".env" ]; then
            cp .env.example .env
            print_warning "Created .env file from .env.example. Please edit it with your configuration."
        fi
        npm install
        cd ..
    fi
    
    # Install frontend
    if [ -d "frontend" ]; then
        print_info "Installing frontend..."
        cd frontend
        npm install
        cd ..
    fi
    
    print_info "All dependencies installed successfully!"
}

function start_dev() {
    print_info "Starting development environment..."
    
    # Check if dependencies are installed
    if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
        print_warning "Dependencies not found. Installing..."
        install_dependencies
    fi
    
    # Start backend
    print_info "Starting backend..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Start frontend
    print_info "Starting frontend..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    print_info "Development environment started!"
    print_info "Frontend: http://localhost:5173"
    print_info "Backend: http://localhost:3001"
    print_info "Press Ctrl+C to stop all services"
    
    # Wait for interrupt
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
}

function start_docker() {
    print_info "Starting Docker environment..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    docker compose up --build
}

function show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  install   Install all dependencies"
    echo "  dev       Start development environment"
    echo "  docker    Start Docker environment"
    echo "  help      Show this help message"
    echo ""
    echo "If no command is provided, 'dev' will be used as default."
}

# Main execution
case "${1:-dev}" in
    install)
        install_dependencies
        ;;
    dev)
        start_dev
        ;;
    docker)
        start_docker
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
