# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
COPY .yarnrc ./.yarnrc
COPY .yarn ./.yarn
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN yarn nx build backend --prod

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/.yarnrc ./.yarnrc
COPY --from=builder /app/.yarn ./.yarn
RUN yarn install --frozen-lockfile --production

# Copy built assets from builder
COPY --from=builder /app/dist/apps/backend ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

# Start the application
CMD ["node", "dist/main.js"] 