# ──────────────────────────────────────────────────────────────────────────────
# Dockerfile – multi-stage build for the Sud-Kivu Next.js application
#
# Produces a minimal runtime image using the standalone output of Next.js.
# Deploy to Azure App Service (Web App for Containers) or Azure Container Apps.
#
# Build:  docker build -t sudkivu .
# Run:    docker run -p 3000:3000 sudkivu
# ──────────────────────────────────────────────────────────────────────────────

# ── Stage 1: install dependencies ─────────────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── Stage 2: build the Next.js application ────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next.config.js uses output: 'standalone'
RUN npm run build

# ── Stage 3: minimal production runtime ───────────────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Azure App Service sets PORT automatically; default to 3000 for local Docker runs
ENV PORT=3000

# Copy the standalone server produced by Next.js
COPY --from=builder /app/.next/standalone ./

# Copy static assets served under /_next/static
COPY --from=builder /app/.next/static ./.next/static

# Copy the public directory (images, favicons, docs, etc.)
COPY --from=builder /app/public ./public

# Copy legacy HTML pages served by the catch-all route
COPY --from=builder /app/*.html ./

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
