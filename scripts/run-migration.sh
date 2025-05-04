#!/bin/bash
set -e

# Name of the backend container (defaults to "ecommerce-web-backend-1" if no parameter is provided)
CONTAINER_NAME=${1:-"ecommerce-web-backend-1"}

echo "Running migrations in container $CONTAINER_NAME..."

# First explore the container to find the correct files
echo "Exploring container filesystem..."
docker exec $CONTAINER_NAME /bin/bash -c "cd /app && find . -name typeorm.config.ts | grep -v node_modules" || echo "No typeorm.config.ts found"

# Try different approaches to run migrations
echo "Attempt 1: Using tsconfig.migration.json directly..."
docker exec $CONTAINER_NAME /bin/bash -c "cd /app && yarn typeorm -P ./libs/database/tsconfig.migration.json migration:run" || echo "Attempt 1 failed"

echo "Attempt 2: Using typeorm with project path..."
docker exec $CONTAINER_NAME /bin/bash -c "cd /app && NODE_ENV=development yarn typeorm -P ./libs/database/tsconfig.migration.json migration:run -d ./libs/database/src/config/typeorm.config.ts" || echo "Attempt 2 failed"

echo "Attempt 3: Direct npx approach..."
docker exec $CONTAINER_NAME /bin/bash -c "cd /app && NODE_ENV=development npx ts-node -P ./libs/database/tsconfig.migration.json -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d ./libs/database/src/config/typeorm.config.ts" || echo "Attempt 3 failed"

echo "Attempt 4: Simplified approach with ts-node..."
docker exec $CONTAINER_NAME /bin/bash -c "cd /app && NODE_ENV=development npx ts-node ./node_modules/typeorm/cli.js migration:run -d ./libs/database/src/config/typeorm.config.ts" || echo "Attempt 4 failed"

echo "Migration attempts completed. Check logs for success or failure." 