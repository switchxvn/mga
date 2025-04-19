# Stage 1: Dependencies
FROM node:20-slim AS deps

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl python3 make g++ git \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV NX_SKIP_NX_CACHE_CREATION=true
ENV NX_DAEMON=false
ENV CYPRESS_INSTALL_BINARY=0

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./
COPY nx.json ./

# Install dependencies in smaller chunks to avoid memory issues
RUN yarn config set ignore-engines true && \
    yarn config set network-timeout 300000 && \
    yarn install --frozen-lockfile --production=false

# Stage 2: Builder
FROM node:20-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl python3 make g++ git \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV NX_SKIP_NX_CACHE_CREATION=true
ENV NX_DAEMON=false
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_OPTIONS="--max_old_space_size=4096"

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy project files
COPY package.json yarn.lock ./
COPY nx.json tsconfig.base.json ./
COPY tsconfig.json ./
COPY eslint.config.mjs ./
COPY .prettierrc .prettierignore ./

# Copy source code including backend
COPY libs ./libs
COPY apps ./apps

# Build argument for environment file
ARG ENV_FILE=.env
ENV ENV_FILE=${ENV_FILE}

# Copy environment file
COPY apps/api/${ENV_FILE} apps/api/.env

# Build the application
RUN yarn nx build api --prod

# Stage 3: Runner
FROM node:20-slim AS runner

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV NODE_ENV=production

# Copy package files for production dependencies
COPY package.json yarn.lock ./

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist/apps/api ./dist
# Copy the entire apps directory to ensure shared modules are available
COPY --from=builder /app/apps ./apps

# Copy environment file
COPY --from=builder /app/apps/api/.env .env

# Create and setup entrypoint script
COPY scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 4000

# Use the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/main.js"] 