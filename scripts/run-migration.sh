#!/bin/bash
set -e

# Name of the backend container (defaults to "ecommerce-web-backend-1" if no parameter is provided)
CONTAINER_NAME=${1:-"ecommerce-web-backend-1"}

echo "Running migrations in container $CONTAINER_NAME..."

# Execute the migration command inside the container with correct path resolution
docker exec -it $CONTAINER_NAME /bin/bash -c "cd /app && yarn typeorm migration:run -d libs/database/src/config/typeorm.config.ts"

echo "Migration completed." 