# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
COPY .yarnrc ./.yarnrc
COPY .yarn ./.yarn
# Copy workspace configs
COPY nx.json tsconfig.base.json ./

# Install dependencies first (better layer caching)
RUN yarn install --frozen-lockfile

# Copy source code
COPY apps ./apps
COPY libs ./libs

# Set Node options to increase memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build shared library first
RUN yarn nx build shared

# Build the frontend app
RUN cd apps/frontend && npx nuxt build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/apps/frontend/.output ./.output

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["node", "./.output/server/index.mjs"] 