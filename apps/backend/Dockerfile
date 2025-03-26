# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Create cache directory and set permissions
RUN mkdir -p /app/.yarn-cache && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Set yarn cache directory
ENV YARN_CACHE_FOLDER=/app/.yarn-cache

# Copy package files
COPY --chown=node:node package.json yarn.lock ./

# Copy the nx workspace files
COPY --chown=node:node nx.json tsconfig.base.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy TypeScript configs and source code for migrations
COPY --chown=node:node tsconfig.json tsconfig.base.json ./
COPY --chown=node:node libs ./libs

# Copy remaining source code
COPY --chown=node:node . .

# Build argument for environment file
ARG ENV_FILE=.env
ENV ENV_FILE=${ENV_FILE}

# Copy environment file
COPY --chown=node:node apps/backend/${ENV_FILE} apps/backend/.env

# Build the application and verify output
RUN yarn nx build backend --prod && \
    ls -la dist/apps/backend || exit 1

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create cache directory and set permissions
RUN mkdir -p /app/.yarn-cache && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Set yarn cache directory
ENV YARN_CACHE_FOLDER=/app/.yarn-cache

# Copy package files
COPY --chown=node:node package.json yarn.lock ./

# Copy TypeScript configs and libs for migrations
COPY --chown=node:node tsconfig.json tsconfig.base.json ./
COPY --chown=node:node libs ./libs

# Install production dependencies only
RUN yarn install --production --frozen-lockfile

# Copy built application
COPY --chown=node:node --from=builder /app/dist/apps/backend/ ./dist/

# Copy environment file
COPY --chown=node:node --from=builder /app/apps/backend/.env .env

# Create entrypoint script
RUN echo '#!/bin/sh\n\
set -e\n\
\n\
# Run migrations if RUN_MIGRATIONS is set to true\n\
if [ "$RUN_MIGRATIONS" = "true" ]; then\n\
    echo "Running database migrations..."\n\
    yarn typeorm migration:run -d libs/database/src/config/typeorm.config.ts || exit 1\n\
fi\n\
\n\
# Start the application\n\
exec "$@"' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 3333

# Set production environment
ENV NODE_ENV=production

# Use the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/main.js"] 