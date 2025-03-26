#!/bin/bash

# Exit on any error
set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "Loading configuration from .env file..."
    export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
else
    echo "Error: .env file not found in project root"
    exit 1
fi

# Validate required environment variables
if [ -z "$GITHUB_USERNAME" ] || [ -z "$REGISTRY" ]; then
    echo "Error: GITHUB_USERNAME and REGISTRY must be set in .env file"
    exit 1
fi

# Validate GITHUB_TOKEN for build command
check_github_token() {
    if [ -z "$GITHUB_TOKEN" ]; then
        echo "Error: GITHUB_TOKEN must be set in .env file for building and pushing images"
        exit 1
    fi
}

# Help function
show_help() {
    echo "Usage: ./docker.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  build       Build and push all Docker images to GHCR"
    echo "  run         Pull and run all containers"
    echo "  stop        Stop and remove all containers"
    echo "  restart     Stop and restart all containers"
    echo "  status      Show status of all containers"
    echo ""
    echo "Options:"
    echo "  -v, --version    Specify version tag (default: latest for run, git tag for build)"
    echo "  -h, --help       Show this help message"
}

# Stop function
stop_containers() {
    echo "Stopping containers..."
    docker stop ew-frontend ew-backend ew-nginx 2>/dev/null || true
    docker rm ew-frontend ew-backend ew-nginx 2>/dev/null || true
    echo "Containers stopped and removed."
}

# Parse command line arguments
COMMAND=""
VERSION="${VERSION:-}"  # Use VERSION from .env if set

while [[ $# -gt 0 ]]; do
    case $1 in
        build|run|stop|restart|status)
            COMMAND="$1"
            shift
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Execute command
case $COMMAND in
    "build")
        check_github_token
        $SCRIPT_DIR/build.sh
        ;;
    "run")
        if [ -n "$VERSION" ]; then
            export VERSION
        fi
        $SCRIPT_DIR/run.sh
        ;;
    "stop")
        stop_containers
        ;;
    "restart")
        stop_containers
        if [ -n "$VERSION" ]; then
            export VERSION
        fi
        $SCRIPT_DIR/run.sh
        ;;
    "status")
        echo "Container Status:"
        docker ps --filter "name=ew-"
        ;;
    *)
        show_help
        exit 1
        ;;
esac 