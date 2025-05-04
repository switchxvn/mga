#!/bin/bash
set -e

# Name of the backend container (defaults to "ecommerce-web-backend-1" if no parameter is provided)
CONTAINER_NAME=${1:-"ecommerce-web-backend-1"}

echo "Running migrations in container $CONTAINER_NAME..."

# Try different approaches to run migrations
echo "Attempt 1: Using direct path..."
docker exec -f $CONTAINER_NAME /bin/bash -c "cd /app && NODE_ENV=development npx typeorm migration:run -d src/config/typeorm.config.ts" || true

echo "Attempt 2: Using relative path..."
docker exec -f $CONTAINER_NAME /bin/bash -c "cd /app && NODE_ENV=development npx typeorm migration:run -d ./dist/libs/database/src/config/typeorm.config.js" || true

echo "Attempt 3: Using package.json script..."
docker exec -f $CONTAINER_NAME /bin/bash -c "cd /app && NODE_ENV=development yarn migration:run" || true

echo "Migration attempts completed. Check logs for success or failure." 