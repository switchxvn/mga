# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
COPY .yarnrc ./.yarnrc
COPY .yarn ./.yarn
# Copy workspace configs nếu bạn đang sử dụng monorepo
COPY nx.json tsconfig.base.json ./
# Copy frontend app
COPY apps/frontend ./apps/frontend
# Copy shared packages/libs nếu có
COPY packages ./packages
COPY libs ./libs

RUN yarn install --frozen-lockfile
# Thêm @headlessui/tailwindcss
RUN yarn add -D @headlessui/tailwindcss

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