#!/bin/bash
set -e

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set default app name if not defined
APP_NAME="${APP_NAME:-cable-car}"

# Name of the backend container (defaults to APP_NAME-backend if no parameter is provided)
CONTAINER_NAME=${1:-"${APP_NAME}-backend"}

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