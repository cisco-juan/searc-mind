# Multi-stage build para SearchMind Backend
FROM docker.io/node:18-alpine AS base

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

WORKDIR /app

# Stage 1: Dependencies
FROM base AS deps
COPY package*.json ./
COPY libs/package.json ./libs/
COPY apps/backend/package.json ./apps/backend/
RUN npm ci --only=production

# Stage 2: Build
FROM base AS build
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY libs/ ./libs/
COPY apps/backend/ ./apps/backend/
RUN npm ci
RUN npm run build:backend

# Stage 3: Production
FROM docker.io/node:18-alpine AS production

RUN apk add --no-cache \
    python3 \
    make \
    g++

WORKDIR /app

# Crear usuario no-root
RUN addgroup --system search-mind && \
    adduser --system -G search-mind search-mind

# Copiar dependencias de producción
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/libs ./libs

# Copiar aplicación construida
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/package.json ./package.json

# Configurar variables de entorno
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Cambiar ownership
RUN chown -R search-mind:search-mind /app

# Cambiar a usuario no-root
USER search-mind

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/agent/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/main.js"]
