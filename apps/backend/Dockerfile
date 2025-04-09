# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install system dependencies for native modules
RUN apt-get update && apt-get install -y \
    curl python3 make g++ git \
    && rm -rf /var/lib/apt/lists/*

# Create cache directory and set permissions
RUN mkdir -p /app/.yarn-cache && \
    chown -R node:node /app

# Set environment variables
ENV YARN_CACHE_FOLDER=/app/.yarn-cache
ENV NX_SKIP_NX_CACHE_CREATION=true
ENV NX_DAEMON=false
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_OPTIONS="--max_old_space_size=6096 --no-experimental-fetch"

# Copy package files
COPY package.json yarn.lock ./
COPY nx.json tsconfig.base.json ./

# Copy root ESLint config files
COPY eslint.config.mjs ./

# Install dependencies
RUN yarn config set ignore-engines true && \
    yarn install --frozen-lockfile --network-timeout 300000

# Copy TypeScript configs and source code for migrations
COPY tsconfig.json tsconfig.base.json ./
COPY libs ./libs

# Copy remaining source code for the backend
COPY apps/backend ./apps/backend

# Copy other config files that might be referenced
COPY .prettierrc .prettierignore ./

# Build argument for environment file
ARG ENV_FILE=.env
ENV ENV_FILE=${ENV_FILE}

# Copy environment file
COPY apps/backend/${ENV_FILE} apps/backend/.env

# Build the application and verify output
RUN yarn nx build backend --prod && \
    ls -la dist/apps/backend || exit 1

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create cache directory and set permissions
RUN mkdir -p /app/.yarn-cache && \
    chown -R node:node /app

# Set environment variables
ENV YARN_CACHE_FOLDER=/app/.yarn-cache
ENV NODE_ENV=production
ENV NX_SKIP_NX_CACHE_CREATION=true
ENV NX_DAEMON=false
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_OPTIONS="--no-experimental-fetch"

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn config set ignore-engines true && \
    yarn install --production --frozen-lockfile --network-timeout 300000

# Copy built application
COPY --from=builder /app/dist/apps/backend/ ./dist/

# Copy environment file
COPY --from=builder /app/apps/backend/.env .env

# Create entrypoint script
COPY scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 3333

# Use the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/main.js"] 