#!/bin/bash
set -e

# Name of the backend container (defaults to "ecommerce-web-backend-1" if no parameter is provided)
CONTAINER_NAME=${1:-"ecommerce-web-backend-1"}

echo "Running migrations in container $CONTAINER_NAME..."

# First, list directories to see what's available in the container
echo "Checking directory structure in container..."
docker exec -it $CONTAINER_NAME /bin/bash -c "find /app -name typeorm.config.ts -type f | grep -v node_modules"

# Now run the migration using the discovered path
echo "Running migration..."
docker exec -it $CONTAINER_NAME /bin/bash -c "cd /app && NODE_ENV=development npx typeorm-ts-node-commonjs migration:run -d src/config/typeorm.config.ts"

echo "Migration completed." 