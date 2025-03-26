#!/bin/bash

# Exit on any error
set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment variables if not already loaded
if [ -z "$GITHUB_USERNAME" ] || [ -z "$REGISTRY" ]; then
    if [ -f "$PROJECT_ROOT/.env" ]; then
        export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
    else
        echo "Error: .env file not found and environment variables not set"
        exit 1
    fi
fi

# Set default version if not specified
VERSION="${VERSION:-latest}"
NETWORK_NAME="app-network"

# Create network if it doesn't exist
if ! docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
    echo "Creating network: $NETWORK_NAME"
    docker network create $NETWORK_NAME
fi

# Function to pull and run a container
pull_and_run() {
    local SERVICE=$1
    local PORTS=$2
    local ENV_FILE=$3
    local EXTRA_ARGS=$4

    echo "Pulling $SERVICE image..."
    docker pull $REGISTRY/$GITHUB_USERNAME/ew-$SERVICE:$VERSION

    echo "Stopping existing $SERVICE container if running..."
    docker stop ew-$SERVICE 2>/dev/null || true
    docker rm ew-$SERVICE 2>/dev/null || true

    echo "Starting $SERVICE container..."
    if [ -n "$ENV_FILE" ]; then
        docker run -d \
            --name ew-$SERVICE \
            --network $NETWORK_NAME \
            $PORTS \
            --env-file $ENV_FILE \
            $EXTRA_ARGS \
            $REGISTRY/$GITHUB_USERNAME/ew-$SERVICE:$VERSION
    else
        docker run -d \
            --name ew-$SERVICE \
            --network $NETWORK_NAME \
            $PORTS \
            $EXTRA_ARGS \
            $REGISTRY/$GITHUB_USERNAME/ew-$SERVICE:$VERSION
    fi
}

# Pull and run backend
pull_and_run "backend" "-p 3333:3333" "apps/backend/.env" "-e NODE_ENV=production"

# Pull and run frontend
pull_and_run "frontend" "-p 3000:4201" "apps/frontend/.env" "-e NODE_ENV=production -e HOST=0.0.0.0"

# Pull and run nginx
pull_and_run "nginx" "-p 80:80 -p 443:443" "" "-v /etc/nginx/ssl:/etc/nginx/ssl:ro"

echo "All containers are up and running!"
echo "You can check their status with: docker ps" 