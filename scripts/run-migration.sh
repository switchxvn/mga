#!/bin/bash
set -e

# Name of the backend container (defaults to "ecommerce-web-backend-1" if no parameter is provided)
CONTAINER_NAME=${1:-"cable-car-backend"}

echo "Running migrations in container $CONTAINER_NAME..."

# Check if container exists
if ! docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
    echo "Error: Container $CONTAINER_NAME not found or not running"
    exit 1
fi

echo "Executing migration in container $CONTAINER_NAME..."
docker exec $CONTAINER_NAME /bin/bash -c "cd /app && \
    NODE_ENV=production \
    npx ts-node \
    -P ./libs/database/tsconfig.migration.json \
    -r tsconfig-paths/register \
    ./node_modules/typeorm/cli.js \
    migration:run \
    -d ./libs/database/src/config/typeorm.config.ts"

echo "Migration completed successfully." 