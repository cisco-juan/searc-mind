# SearchMind

**Sistema RAG (Retrieval-Augmented Generation) - Tu Asistente Personal Inteligente**

SearchMind es una aplicación web inteligente que utiliza técnicas de inteligencia artificial para crear un asistente personal personalizado con tus propios datos. Combina la potencia de modelos de lenguaje locales (Ollama) con búsqueda vectorial para proporcionar respuestas precisas y contextualizadas basadas en los documentos que tú alimentes al sistema.

## 🚀 Características

- **RAG (Retrieval-Augmented Generation)**: Búsqueda inteligente en tus documentos personales con contexto relevante
- **Modelos LLM Locales**: Integración con Ollama para procesamiento offline y máxima privacidad
- **Búsqueda Vectorial**: PostgreSQL con pgvector para similitud semántica de tus datos
- **Asistente Personalizado**: Alimenta el sistema con tus propios documentos, notas, manuales o conocimiento
- **Interfaz Web Moderna**: Frontend construido con Next.js 15 y React 19
- **API RESTful**: Backend robusto con Express.js y TypeScript
- **Containerización**: Despliegue completo con Docker y docker-compose
- **Privacidad Total**: Todos los datos permanecen en tu infraestructura local

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   + pgvector    │
│   Puerto: 3001  │    │   Puerto: 3000  │    │   Puerto: 5432  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │                       ▼                       
         │              ┌─────────────────┐              
         └─────────────►│     Ollama      │              
                        │   Puerto: 11434 │              
                        └─────────────────┘              
```

### Componentes Principales

- **Apps**:
  - `frontend/`: Interfaz web con Next.js 15, React 19 y Tailwind CSS
  - `backend/`: API servidor con Express.js y TypeScript
- **Libs**: Biblioteca compartida con tipos TypeScript y utilidades
- **Servicios**:
  - `RAGService`: Gestión de documentos, búsqueda por similitud y generación de contexto
  - `OllamaService`: Interface para chat y embeddings con modelos locales
  - `DocumentLoader`: Procesamiento y carga de documentos

## 📋 Prerrequisitos

- **Node.js** >= 18.x
- **Docker** y **Docker Compose**
- **PostgreSQL** con extensión `pgvector` (incluido en el stack Docker)
- **Ollama** (incluido en el stack Docker)

## 🛠️ Instalación

### Opción 1: Usando Docker (Recomendado)

1. **Clonar el repositorio**:
```bash
git clone <repository-url>
cd search-mind
```

2. **Configurar variables de entorno**:
```bash
cp apps/backend/.env.template apps/backend/.env
# Editar apps/backend/.env según sea necesario
```

3. **Construir y ejecutar con Docker**:
```bash
# Construir todas las imágenes
docker-compose build

# Ejecutar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

4. **Verificar la instalación**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Ollama: http://localhost:11434

### Opción 2: Desarrollo Local

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar base de datos**:
   - Instalar PostgreSQL con pgvector
   - Crear base de datos `search_mind`
   - Configurar `DATABASE_URL` en `.env`

3. **Instalar y configurar Ollama**:
```bash
# Instalar Ollama (Linux/Mac)
curl -fsSL https://ollama.ai/install.sh | sh

# Descargar modelos necesarios
ollama pull gemma2:2b
ollama pull nomic-embed-text
```

4. **Ejecutar servicios**:
```bash
# Backend
npx nx serve backend

# Frontend (en otra terminal)
npx nx dev frontend
```

## 🚀 Uso

### Interfaz Web

1. Abrir http://localhost:3001 en el navegador
2. Cargar tus documentos personales (PDFs, textos, manuales, notas) usando el formulario de upload
3. Realizar consultas en lenguaje natural sobre tu contenido
4. Recibir respuestas contextualizadas basadas en tus documentos personales

### API Endpoints

#### Consultas RAG
```bash
POST /api/agent/query
Content-Type: application/json

{
  "query": "¿Cuáles son los pasos para configurar mi proyecto?"
}
```

#### Carga de Documentos
```bash
POST /api/agent/upload
Content-Type: multipart/form-data

# Archivo PDF, texto, manual, notas o cualquier documento personal
```

#### Estadísticas
```bash
GET /api/agent/statistics
```

#### Salud del Sistema
```bash
GET /api/agent/health
```

#### Limpiar Documentos
```bash
DELETE /api/agent/documents
```

## 💻 Desarrollo

### Comandos Nx

```bash
# Ejecutar backend en modo desarrollo
npx nx serve backend

# Ejecutar frontend en modo desarrollo  
npx nx dev frontend

# Construir proyectos
npx nx build backend
npx nx build frontend
npx nx build libs

# Ejecutar linting
npx nx lint backend
npx nx lint frontend

# Verificación de tipos
npx nx typecheck backend
npx nx typecheck frontend

# Tests end-to-end
npx nx e2e backend-e2e

# Construir todos los proyectos
npx nx run-many -t build

# Ver gráfico de dependencias
npx nx graph
```

### Configuración de Entorno

Archivo `apps/backend/.env`:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/search_mind
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=gemma2:2b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

## 🐳 Docker

### Servicios Incluidos

- **database**: PostgreSQL 15 con pgvector
- **ollama**: Servidor Ollama para modelos LLM locales
- **backend**: API Express.js
- **frontend**: Aplicación Next.js
- **nginx**: Proxy reverso con rate limiting (perfil production)

### Comandos Docker

```bash
# Ejecutar stack completo
docker-compose up -d

# Solo servicios básicos (sin nginx)
docker-compose up -d database ollama backend frontend

# Ejecutar con nginx (producción)
docker-compose --profile production up -d

# Reconstruir imágenes
docker-compose build --no-cache

# Ver logs específicos
docker-compose logs backend
docker-compose logs frontend

# Limpiar volúmenes
docker-compose down -v
```

## 📊 Monitoreo

### Health Checks

Todos los servicios incluyen health checks configurados:

- **Backend**: `GET /api/agent/health`
- **Frontend**: Verificación del servidor Next.js
- **Database**: `pg_isready`
- **Ollama**: `GET /api/tags`

### Logs

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔧 Personalización

### Modelos Ollama

Para cambiar modelos, actualizar en `docker-compose.yml`:
```yaml
environment:
  - OLLAMA_CHAT_MODEL=gemma2:2b  # Cambiar modelo de chat
  - OLLAMA_EMBEDDING_MODEL=nomic-embed-text  # Cambiar modelo de embeddings
```

### Configuración de Base de Datos

El script `init-db.sql` configura automáticamente:
- Extensión pgvector
- Tabla de documentos con índices optimizados
- Triggers para timestamps

## 🤝 Contribución

1. **Fork del repositorio**: Haz un fork del proyecto a tu cuenta de GitHub
2. **Clonar tu fork**: `git clone https://github.com/tu-usuario/search-mind.git`
3. **Crear rama feature**: `git checkout -b feature/nueva-funcionalidad`
4. **Realizar cambios**: Implementa tu funcionalidad o corrección
5. **Commit cambios**: `git commit -am 'Agregar nueva funcionalidad'`
6. **Push a tu fork**: `git push origin feature/nueva-funcionalidad`
7. **Crear Pull Request**: Desde tu fork hacia el repositorio original

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para detalles.

## 🆘 Soporte

Para reportar problemas o solicitar funcionalidades, crear un issue en el repositorio.

---

**SearchMind** - Tu asistente personal inteligente alimentado con tus propios datos