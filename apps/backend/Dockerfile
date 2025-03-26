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

# Copy source code
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

# Install production dependencies only
RUN yarn install --production --frozen-lockfile

# Copy built application
COPY --chown=node:node --from=builder /app/dist/apps/backend/ ./dist/

# Copy environment file
COPY --chown=node:node --from=builder /app/apps/backend/.env .env

# Expose the port the app runs on
EXPOSE 3333

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main.js"] 