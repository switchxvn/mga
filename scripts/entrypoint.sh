#!/bin/sh
set -e

# Run migrations if RUN_MIGRATIONS is set to true
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running database migrations..."
    yarn typeorm migration:run -d libs/database/src/config/typeorm.config.ts || exit 1
fi

# Start the application
exec "$@" 