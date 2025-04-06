# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Create cache directory and set permissions
RUN mkdir -p /app/.yarn-cache && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Set yarn cache directory
ENV YARN_CACHE_FOLDER=/app/.yarn-cache

# Copy only necessary package files
COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node nx.json tsconfig.base.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy only frontend related files
COPY --chown=node:node apps/frontend ./apps/frontend
COPY --chown=node:node libs ./libs

# Build argument for environment file
ARG ENV_FILE=.env
ENV ENV_FILE=${ENV_FILE}

# Copy environment file
COPY --chown=node:node apps/frontend/${ENV_FILE} apps/frontend/.env

# Build only frontend application
RUN mkdir -p apps/frontend/.output && \
    cd apps/frontend && \
    NODE_OPTIONS="--max-old-space-size=6096" npx nuxt build && \
    ls -la .output/server || exit 1

# Production stage
FROM node:20-alpine AS runner

# Set working directory
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
COPY --chown=node:node --from=builder /app/apps/frontend/.output ./.output

# Copy environment file
COPY --chown=node:node --from=builder /app/apps/frontend/.env .env

# Expose the port the app runs on
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the application
CMD ["node", ".output/server/index.mjs"] 