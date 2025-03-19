# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
COPY .yarnrc ./.yarnrc
COPY .yarn ./.yarn
# Copy workspace configs
COPY nx.json tsconfig.base.json ./
# Copy all workspace packages for proper dependency resolution
COPY apps ./apps

# Install all dependencies including workspace packages
RUN yarn install --frozen-lockfile

# Set Node options to increase memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the app
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