# ----------------------------
# Build stage
# ----------------------------
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apt-get update && apt-get install -y \
curl python3 make g++ git \
&& rm -rf /var/lib/apt/lists/*

# Copy only essential files to install dependencies
COPY package.json yarn.lock ./
COPY nx.json tsconfig.base.json ./

# Set environment to skip Nx daemon and Cypress binary install
ENV YARN_CACHE_FOLDER=/app/.yarn-cache
ENV NX_SKIP_NX_CACHE_CREATION=true
ENV NX_DAEMON=false
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_OPTIONS="--max_old_space_size=4096 --no-experimental-fetch"

# Install dependencies
RUN yarn config set ignore-engines true && \
    NODE_OPTIONS="--openssl-legacy-provider" yarn install --frozen-lockfile --network-timeout 300000

# Copy application code
COPY apps/frontend ./apps/frontend
COPY libs ./libs

# Build argument for environment file
ARG ENV_FILE=.env
ENV ENV_FILE=${ENV_FILE}

# Copy environment file
COPY apps/frontend/${ENV_FILE} apps/frontend/.env

# Build only frontend app with Nuxt
RUN mkdir -p apps/frontend/.output && \
cd apps/frontend && \
NODE_OPTIONS="--max-old-space-size=6096" npx nuxt build && \
ls -la .output/server || exit 1

# ----------------------------
# Production stage
# ----------------------------
FROM node:20 AS runner

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
curl \
&& rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json yarn.lock ./

# Set environment
ENV YARN_CACHE_FOLDER=/app/.yarn-cache
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NX_SKIP_NX_CACHE_CREATION=true
ENV NX_DAEMON=false
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_OPTIONS="--no-experimental-fetch"

# Install production-only deps
RUN yarn config set ignore-engines true && \
    NODE_OPTIONS="--openssl-legacy-provider" yarn install --production --frozen-lockfile --network-timeout 300000

# Copy built output from builder
COPY --from=builder /app/apps/frontend/.output ./.output
COPY --from=builder /app/apps/frontend/.env .env

EXPOSE 3000

# Start Nuxt app
CMD ["node", ".output/server/index.mjs"]
