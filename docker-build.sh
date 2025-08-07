#!/bin/bash

# Script para construir y desplegar SearchMind con Docker

set -e

echo "🚀 SearchMind Docker Build Script"
echo "================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    error "Docker no está corriendo. Por favor, inicia Docker Desktop."
fi

# Verificar que docker-compose esté disponible
if ! command -v docker-compose &> /dev/null; then
    error "docker-compose no está instalado. Por favor, instálalo primero."
fi

# Opciones de construcción
ENVIRONMENT=${1:-"production"}
BUILD_TYPE=${2:-"full"}

log "Ambiente: $ENVIRONMENT"
log "Tipo de build: $BUILD_TYPE"

# Limpiar contenedores y imágenes anteriores (opcional)
if [ "$3" == "--clean" ]; then
    warning "Limpiando contenedores e imágenes anteriores..."
    docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || true
    docker system prune -f
fi

# Seleccionar archivo docker-compose
if [ "$ENVIRONMENT" == "development" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    log "Usando configuración de desarrollo"
else
    COMPOSE_FILE="docker-compose.yml"
    log "Usando configuración de producción"
fi

# Verificar que el archivo existe
if [ ! -f "$COMPOSE_FILE" ]; then
    error "Archivo $COMPOSE_FILE no encontrado"
fi

# Construir según el tipo
case $BUILD_TYPE in
    "backend")
        log "Construyendo solo el backend..."
        docker-compose -f $COMPOSE_FILE build backend
        ;;
    "frontend")
        log "Construyendo solo el frontend..."
        docker-compose -f $COMPOSE_FILE build frontend
        ;;
    "services")
        log "Iniciando solo servicios (DB, Ollama)..."
        docker-compose -f $COMPOSE_FILE up -d database ollama
        ;;
    "full")
        log "Construyendo stack completo..."
        docker-compose -f $COMPOSE_FILE build
        ;;
    *)
        error "Tipo de build no válido. Usa: backend, frontend, services, o full"
        ;;
esac

success "Build completado exitosamente!"

# Iniciar servicios si se especifica
if [ "$4" == "--start" ]; then
    log "Iniciando servicios..."
    
    if [ "$BUILD_TYPE" == "services" ]; then
        docker-compose -f $COMPOSE_FILE up -d database ollama
    else
        if [ "$ENVIRONMENT" == "production" ]; then
            docker-compose -f $COMPOSE_FILE --profile production up -d
        else
            docker-compose -f $COMPOSE_FILE up -d
        fi
    fi
    
    success "Servicios iniciados!"
    
    # Esperar un poco y mostrar estado
    sleep 5
    echo ""
    log "Estado de los servicios:"
    docker-compose -f $COMPOSE_FILE ps
    
    echo ""
    log "URLs disponibles:"
    if [ "$BUILD_TYPE" != "services" ]; then
        echo "  Frontend: http://localhost:3000"
        echo "  Backend API: http://localhost:3001/api/agent/health"
    fi
    if [ "$ENVIRONMENT" == "development" ]; then
        echo "  PgAdmin: http://localhost:8080 (admin@searchmind.com / admin)"
        echo "  Ollama: http://localhost:11435"
        echo "  PostgreSQL: localhost:5433"
    else
        echo "  Ollama: http://localhost:11434"
        echo "  PostgreSQL: localhost:5432"
    fi
fi

echo ""
success "🎉 SearchMind está listo!"