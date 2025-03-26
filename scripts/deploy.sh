#!/bin/bash

# Exit on any error
set -e

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

# Validate required environment variables
if [ -z "$GITHUB_USERNAME" ] || [ -z "$REGISTRY" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_USERNAME, REGISTRY, and GITHUB_TOKEN must be set in .env file"
    exit 1
fi

# Check and login to GitHub Container Registry
echo "Checking GitHub Container Registry authentication..."
if ! docker info | grep -q "ghcr.io"; then
    echo "Logging in to GitHub Container Registry..."
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin
    
    if [ $? -ne 0 ]; then
        echo "Error: Failed to login to GitHub Container Registry"
        exit 1
    fi
fi

# Function to stop and remove container if exists
stop_container() {
    if [ "$(docker ps -q -f name=$1)" ]; then
        echo "Stopping existing $1 container..."
        docker stop $1
        docker rm $1
    fi
}

# Create network if it doesn't exist
if ! docker network inspect app-network >/dev/null 2>&1; then
    echo "Creating docker network: app-network"
    docker network create app-network
fi

# Pull latest images
echo "Pulling latest images..."
docker pull $REGISTRY/$GITHUB_USERNAME/ew-frontend:latest
docker pull $REGISTRY/$GITHUB_USERNAME/ew-backend:latest
docker pull $REGISTRY/$GITHUB_USERNAME/ew-nginx:latest

# Stop and remove existing containers
stop_container "ew-frontend"
stop_container "ew-backend"
stop_container "ew-nginx"

# Start backend
echo "Starting backend..."
docker run -d \
    --name ew-backend \
    --network app-network \
    -p 3333:3333 \
    --env-file apps/backend/.env.production \
    -e NODE_ENV=production \
    --restart unless-stopped \
    $REGISTRY/$GITHUB_USERNAME/ew-backend:latest

# Start frontend
echo "Starting frontend..."
docker run -d \
    --name ew-frontend \
    --network app-network \
    -p 3000:3000 \
    --env-file apps/frontend/.env.production \
    -e NODE_ENV=production \
    -e HOST=0.0.0.0 \
    --restart unless-stopped \
    $REGISTRY/$GITHUB_USERNAME/ew-frontend:latest

# Start nginx
echo "Starting nginx..."
docker run -d \
    --name ew-nginx \
    --network app-network \
    -p 80:80 \
    -p 443:443 \
    -v /etc/nginx/ssl:/etc/nginx/ssl:ro \
    --restart unless-stopped \
    $REGISTRY/$GITHUB_USERNAME/ew-nginx:latest

echo "Deployment completed successfully!"
echo "Services:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:3333"
echo "- Nginx: http://localhost (80) and https://localhost (443)"

# Show running containers
echo -e "\nRunning containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 