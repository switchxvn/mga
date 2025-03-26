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

# Function to wait for container to be healthy
wait_for_container() {
    local container_name=$1
    local max_attempts=30
    local attempt=1

    echo "Waiting for $container_name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if docker ps | grep $container_name | grep -q "Up"; then
            echo "$container_name is ready!"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts: $container_name is not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "Error: $container_name failed to start properly"
    docker logs $container_name
    return 1
}

# Remove existing network if exists and create new one
echo "Setting up docker network..."
docker network rm app-network 2>/dev/null || true
docker network create app-network

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
    --network-alias backend \
    -p 3333:3333 \
    --env-file apps/backend/.env.production \
    -e NODE_ENV=production \
    --restart unless-stopped \
    $REGISTRY/$GITHUB_USERNAME/ew-backend:latest

# Wait for backend to be ready
wait_for_container "ew-backend"

# Start frontend
echo "Starting frontend..."
docker run -d \
    --name ew-frontend \
    --network app-network \
    --network-alias frontend \
    -p 3000:3000 \
    --env-file apps/frontend/.env.production \
    -e NODE_ENV=production \
    -e HOST=0.0.0.0 \
    --restart unless-stopped \
    $REGISTRY/$GITHUB_USERNAME/ew-frontend:latest

# Wait for frontend to be ready
wait_for_container "ew-frontend"

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

# Wait for nginx to be ready
wait_for_container "ew-nginx"

echo "Deployment completed successfully!"
echo "Services:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:3333"
echo "- Nginx: http://localhost (80) and https://localhost (443)"

# Show running containers and their networks
echo -e "\nRunning containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\nNetwork information:"
docker network inspect app-network 