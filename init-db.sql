-- Inicialización de la base de datos para SearchMind
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear la extensión pgvector para búsqueda vectorial
CREATE EXTENSION IF NOT EXISTS vector;

-- Crear tabla para almacenar documentos y embeddings
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(768), -- Ajustar dimensión según el modelo de embedding
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsqueda vectorial eficiente
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Crear índice para búsqueda por metadatos
CREATE INDEX IF NOT EXISTS documents_metadata_idx ON documents USING GIN (metadata);

-- Crear índice para búsqueda por fecha
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents (created_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo (opcional)
-- INSERT INTO documents (content, embedding, metadata) VALUES 
-- ('Documento de ejemplo', '[0.1, 0.2, 0.3]'::vector, '{"source": "ejemplo.txt", "chunk": 1}');

-- Mostrar información de la inicialización
DO $$
BEGIN
    RAISE NOTICE 'Base de datos SearchMind inicializada exitosamente';
    RAISE NOTICE 'Extensión pgvector habilitada';
    RAISE NOTICE 'Tabla documents creada con índices optimizados';
END $$;