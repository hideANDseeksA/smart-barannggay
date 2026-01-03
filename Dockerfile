# =========================
# 1️⃣ Build stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build


# =========================
# 2️⃣ Production stage
# =========================
FROM node:20-alpine

WORKDIR /app

# Copy only what we need from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Expose API port
EXPOSE 3000

# Prisma needs this at runtime
ENV NODE_ENV=production

# Start server
CMD ["node", "dist/server.js"]
