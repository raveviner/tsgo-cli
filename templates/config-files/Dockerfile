# ===== Stage 1: Build =====
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the app and build
COPY . .
RUN npm run build

# ===== Stage 2: Runtime =====
FROM node:20-alpine

WORKDIR /app

# Only copy production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# If you need other static assets (e.g., public folder)
# COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "dist/index.js"]