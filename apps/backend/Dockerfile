# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Create cache directory and set permissions
RUN mkdir -p /app/.yarn-cache && \
    chown -R node:node /app

# Install additional dependencies
RUN apk add --no-cache python3 make g++ git curl

# Switch to non-root user
USER node

# Set yarn cache directory and environment variables
ENV YARN_CACHE_FOLDER=/app/.yarn-cache
ENV NX_SKIP_NX_CACHE_CREATION=true
ENV NX_DAEMON=false
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_OPTIONS="--max_old_space_size=4096 --no-experimental-fetch"

# Copy package files
COPY --chown=node:node package.json yarn.lock ./

# Copy the nx workspace files
COPY --chown=node:node nx.json tsconfig.base.json ./

# Install dependencies
RUN yarn config set ignore-engines true && \
    NODE_OPTIONS="--openssl-legacy-provider" yarn install --frozen-lockfile --network-timeout 300000

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

# Install additional dependencies
RUN apk add --no-cache curl

# Switch to non-root user
USER node

# Set environment variables
ENV YARN_CACHE_FOLDER=/app/.yarn-cache
ENV NODE_ENV=production
ENV NX_SKIP_NX_CACHE_CREATION=true
ENV NX_DAEMON=false
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_OPTIONS="--no-experimental-fetch"

# Copy package files
COPY --chown=node:node package.json yarn.lock ./

# Copy TypeScript configs and libs for migrations
COPY --chown=node:node tsconfig.json tsconfig.base.json ./
COPY --chown=node:node libs ./libs

# Install production dependencies only
RUN yarn config set ignore-engines true && \
    NODE_OPTIONS="--openssl-legacy-provider" yarn install --production --frozen-lockfile --network-timeout 300000

# Copy built application
COPY --chown=node:node --from=builder /app/dist/apps/backend/ ./dist/

# Copy environment file
COPY --chown=node:node --from=builder /app/apps/backend/.env .env

# Switch back to root for entrypoint creation
USER root

# Create entrypoint script
COPY --chown=root:root scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh && \
    chown node:node /app/entrypoint.sh

# Switch back to non-root user
USER node

# Expose the port the app runs on
EXPOSE 3333

# Use the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/main.js"] 