#!/bin/bash

# Exit on any error
set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment variables if not already loaded
if [ -z "$GITHUB_USERNAME" ] || [ -z "$REGISTRY" ] || [ -z "$GITHUB_TOKEN" ]; then
    if [ -f "$PROJECT_ROOT/.env" ]; then
        export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
    else
        echo "Error: .env file not found and environment variables not set"
        exit 1
    fi
fi

# Validate required environment variables
if [ -z "$GITHUB_USERNAME" ] || [ -z "$REGISTRY" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_USERNAME, REGISTRY, and GITHUB_TOKEN must be set in .env file"
    exit 1
fi

# Set version from git if not specified
VERSION=${VERSION:-$(git describe --tags --always)}
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# Check if logged in to GitHub Container Registry and login if needed
echo "Checking GitHub Container Registry authentication..."
if ! docker info | grep -q "ghcr.io"; then
    echo "Logging in to GitHub Container Registry..."
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin
    
    if [ $? -ne 0 ]; then
        echo "Error: Failed to login to GitHub Container Registry"
        exit 1
    fi
fi

# Check for production environment files
if [ ! -f "$PROJECT_ROOT/apps/frontend/.env.production" ]; then
    echo "Error: Frontend production environment file not found at apps/frontend/.env.production"
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/apps/backend/.env.production" ]; then
    echo "Error: Backend production environment file not found at apps/backend/.env.production"
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/apps/api/.env.production" ]; then
    echo "Error: API production environment file not found at apps/api/.env.production"
    exit 1
fi

# Build and push frontend
echo "Building frontend image..."
docker build --platform linux/amd64 \
    -t $REGISTRY/$GITHUB_USERNAME/cable-car-frontend:$VERSION \
    -t $REGISTRY/$GITHUB_USERNAME/cable-car-frontend:latest \
    --build-arg ENV_FILE=.env.production \
    -f apps/frontend/Dockerfile .

echo "Pushing frontend image..."
docker push $REGISTRY/$GITHUB_USERNAME/cable-car-frontend:$VERSION
docker push $REGISTRY/$GITHUB_USERNAME/cable-car-frontend:latest

# Build and push backend
echo "Building backend image..."
docker build --platform linux/amd64 \
    -t $REGISTRY/$GITHUB_USERNAME/cable-car-backend:$VERSION \
    -t $REGISTRY/$GITHUB_USERNAME/cable-car-backend:latest \
    --build-arg ENV_FILE=.env.production \
    -f apps/backend/Dockerfile .

echo "Pushing backend image..."
docker push $REGISTRY/$GITHUB_USERNAME/cable-car-backend:$VERSION
docker push $REGISTRY/$GITHUB_USERNAME/cable-car-backend:latest

# Build and push api
echo "Building api image..."
docker build --platform linux/amd64 \
    -t $REGISTRY/$GITHUB_USERNAME/cable-car-api:$VERSION \
    -t $REGISTRY/$GITHUB_USERNAME/cable-car-api:latest \
    --build-arg ENV_FILE=.env.production \
    -f apps/api/Dockerfile .

echo "Pushing api image..."
docker push $REGISTRY/$GITHUB_USERNAME/cable-car-api:$VERSION
docker push $REGISTRY/$GITHUB_USERNAME/cable-car-api:latest

# Build and push nginx
echo "Building nginx image..."
docker build --platform linux/amd64 \
    -t $REGISTRY/$GITHUB_USERNAME/cable-car-nginx:$VERSION \
    -t $REGISTRY/$GITHUB_USERNAME/cable-car-nginx:latest \
    -f nginx/Dockerfile .

echo "Pushing nginx image..."
docker push $REGISTRY/$GITHUB_USERNAME/cable-car-nginx:$VERSION
docker push $REGISTRY/$GITHUB_USERNAME/cable-car-nginx:latest

echo "Build and push completed successfully!"
echo "Version: $VERSION"
echo "Timestamp: $TIMESTAMP" 