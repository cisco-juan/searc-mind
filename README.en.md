# SearchMind

**RAG (Retrieval-Augmented Generation) System - Your Intelligent Personal Assistant**

[Spanish Version](./README.md)


SearchMind is an intelligent web application that uses artificial intelligence techniques to create a personalized assistant with your own data. It combines the power of local language models (Ollama) with vector search to provide accurate and contextualized responses based on the documents you feed into the system.

## 🚀 Features

- **RAG (Retrieval-Augmented Generation)**: Intelligent search in your personal documents with relevant context
- **Local LLM Models**: Integration with Ollama for offline processing and maximum privacy
- **Vector Search**: PostgreSQL with pgvector for semantic similarity of your data
- **Personalized Assistant**: Feed the system with your own documents, notes, manuals or knowledge
- **Modern Web Interface**: Frontend built with Next.js 15 and React 19
- **RESTful API**: Robust backend with Express.js and TypeScript
- **Containerization**: Complete deployment with Docker and docker-compose
- **Total Privacy**: All data remains in your local infrastructure

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   + pgvector    │
│   Port: 3001    │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │                       ▼                       
         │              ┌─────────────────┐              
         └─────────────►│     Ollama      │              
                        │   Port: 11434   │              
                        └─────────────────┘              
```

### Main Components

- **Apps**:
  - `frontend/`: Web interface with Next.js 15, React 19 and Tailwind CSS
  - `backend/`: API server with Express.js and TypeScript
- **Libs**: Shared library with TypeScript types and utilities
- **Services**:
  - `RAGService`: Document management, similarity search and context generation
  - `OllamaService`: Interface for chat and embeddings with local models
  - `DocumentLoader`: Document processing and loading

## 📋 Prerequisites

- **Node.js** >= 18.x
- **Docker** and **Docker Compose**
- **PostgreSQL** with `pgvector` extension (included in Docker stack)
- **Ollama** (included in Docker stack)

## 🛠️ Installation

### Option 1: Using Docker (Recommended)

1. **Clone the repository**:
```bash
git clone <repository-url>
cd search-mind
```

2. **Configure environment variables**:
```bash
cp apps/backend/.env.template apps/backend/.env
# Edit apps/backend/.env as needed
```

3. **Build and run with Docker**:
```bash
# Build all images
docker-compose build

# Run all services
docker-compose up -d

# View logs
docker-compose logs -f
```

4. **Verify installation**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Ollama: http://localhost:11434

### Option 2: Local Development

1. **Install dependencies**:
```bash
npm install
```

2. **Configure database**:
   - Install PostgreSQL with pgvector
   - Create database `search_mind`
   - Configure `DATABASE_URL` in `.env`

3. **Install and configure Ollama**:
```bash
# Install Ollama (Linux/Mac)
curl -fsSL https://ollama.ai/install.sh | sh

# Download required models
ollama pull gemma2:2b
ollama pull nomic-embed-text
```

4. **Run services**:
```bash
# Backend
npx nx serve backend

# Frontend (in another terminal)
npx nx dev frontend
```

## 🚀 Usage

### Web Interface

1. Open http://localhost:3001 in your browser
2. Load your personal documents (PDFs, texts, manuals, notes) using the upload form
3. Make queries in natural language about your content
4. Receive contextualized responses based on your personal documents

### API Endpoints

#### RAG Queries
```bash
POST /api/agent/query
Content-Type: application/json

{
  "query": "What are the steps to configure my project?"
}
```

#### Document Upload
```bash
POST /api/agent/upload
Content-Type: multipart/form-data

# PDF file, text, manual, notes or any personal document
```

#### Statistics
```bash
GET /api/agent/statistics
```

#### System Health
```bash
GET /api/agent/health
```

#### Clear Documents
```bash
DELETE /api/agent/documents
```

## 💻 Development

### Nx Commands

```bash
# Run backend in development mode
npx nx serve backend

# Run frontend in development mode  
npx nx dev frontend

# Build projects
npx nx build backend
npx nx build frontend
npx nx build libs

# Run linting
npx nx lint backend
npx nx lint frontend

# Type checking
npx nx typecheck backend
npx nx typecheck frontend

# End-to-end tests
npx nx e2e backend-e2e

# Build all projects
npx nx run-many -t build

# View dependency graph
npx nx graph
```

### Environment Configuration

File `apps/backend/.env`:
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

### Included Services

- **database**: PostgreSQL 15 with pgvector
- **ollama**: Ollama server for local LLM models
- **backend**: Express.js API
- **frontend**: Next.js application
- **nginx**: Reverse proxy with rate limiting (production profile)

### Docker Commands

```bash
# Run complete stack
docker-compose up -d

# Only basic services (without nginx)
docker-compose up -d database ollama backend frontend

# Run with nginx (production)
docker-compose --profile production up -d

# Rebuild images
docker-compose build --no-cache

# View specific logs
docker-compose logs backend
docker-compose logs frontend

# Clean volumes
docker-compose down -v
```

## 📊 Monitoring

### Health Checks

All services include configured health checks:

- **Backend**: `GET /api/agent/health`
- **Frontend**: Next.js server verification
- **Database**: `pg_isready`
- **Ollama**: `GET /api/tags`

### Logs

```bash
# Logs from all services
docker-compose logs -f

# Specific logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔧 Customization

### Ollama Models

To change models, update in `docker-compose.yml`:
```yaml
environment:
  - OLLAMA_CHAT_MODEL=gemma2:2b  # Change chat model
  - OLLAMA_EMBEDDING_MODEL=nomic-embed-text  # Change embedding model
```

### Database Configuration

The `init-db.sql` script automatically configures:
- pgvector extension
- Documents table with optimized indexes
- Triggers for timestamps

## 🤝 Contributing

1. **Fork the repository**: Fork the project to your GitHub account
2. **Clone your fork**: `git clone https://github.com/your-username/search-mind.git`
3. **Create feature branch**: `git checkout -b feature/new-functionality`
4. **Make changes**: Implement your functionality or fix
5. **Commit changes**: `git commit -am 'Add new functionality'`
6. **Push to your fork**: `git push origin feature/new-functionality`
7. **Create Pull Request**: From your fork to the original repository

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🆘 Support

To report issues or request features, create an issue in the repository.

---

**SearchMind** - Your intelligent personal assistant powered by your own data