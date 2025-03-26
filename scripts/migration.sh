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

# Function to build migration image
build_image() {
    echo "Building migration image..."
    docker build \
        -t $REGISTRY/$GITHUB_USERNAME/ew-migration:$VERSION \
        -f apps/backend/Dockerfile.migration \
        .

    if [ $? -eq 0 ]; then
        echo "✅ Migration image built successfully!"
    else
        echo "❌ Failed to build migration image!"
        exit 1
    fi

    # Push image if PUSH=true
    if [ "$PUSH" = "true" ]; then
        echo "Pushing migration image to registry..."
        docker push $REGISTRY/$GITHUB_USERNAME/ew-migration:$VERSION
    fi
}

# Function to run migration
run_migration() {
    echo "Pulling migration image..."
    if [ "$PUSH" != "true" ]; then
        # Skip pull if we just built locally
        echo "Skipping pull since we built locally..."
    else
        docker pull $REGISTRY/$GITHUB_USERNAME/ew-migration:$VERSION
    fi

    echo "Stopping existing migration container if running..."
    docker stop ew-migration 2>/dev/null || true
    docker rm ew-migration 2>/dev/null || true

    echo "Running database migrations..."
    docker run --rm \
        --name ew-migration \
        --network $NETWORK_NAME \
        --env-file apps/backend/.env \
        $REGISTRY/$GITHUB_USERNAME/ew-migration:$VERSION

    if [ $? -eq 0 ]; then
        echo "✅ Database migrations completed successfully!"
    else
        echo "❌ Database migrations failed!"
        exit 1
    fi
}

# Build image first
build_image

# Run migrations
run_migration

echo "Migration process completed!" 