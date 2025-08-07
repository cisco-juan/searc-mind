# Multi-stage build para SearchMind Frontend
FROM docker.io/node:18-alpine AS base

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Dependencies
FROM base AS deps
# Copiar archivos de dependencias
COPY package*.json ./
COPY libs/package.json ./libs/
COPY apps/frontend/package.json ./apps/frontend/
RUN npm ci

# Stage 2: Build
FROM base AS build
WORKDIR /app

# Copiar dependencias
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/libs ./libs

# Copiar código fuente
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY libs/ ./libs/
COPY apps/frontend/ ./apps/frontend/

# Variables de entorno para el build
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:3001

# Build de la aplicación
RUN npm run build:frontend

# Stage 3: Production
FROM docker.io/node:18-alpine AS production

WORKDIR /app

# Crear usuario no-root
RUN addgroup --system nextjs && \
    adduser --system -G nextjs nextjs

# Copiar archivos necesarios para Next.js
COPY --from=build /app/apps/frontend/next.config.js ./
COPY --from=build /app/apps/frontend/package.json ./
COPY --from=build /app/apps/frontend/public ./public

# Copiar archivos build de Next.js
COPY --from=build --chown=nextjs:nextjs /app/apps/frontend/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/apps/frontend/.next/static ./.next/static

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Cambiar a usuario no-root  
USER nextjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "server.js"]