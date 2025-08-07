export interface QueryRequest {
    query: string;
    maxResults?: number;
    includeMetadata?: boolean;
  }
  
  export interface QueryResponse {
    success: boolean;
    query: string;
    response: string;
    timestamp: string;
    processingTime?: number;
  }
  
  export interface DocumentSource {
    content: string;
    metadata: DocumentMetadata;
    similarity: number;
  }
  
  export interface DocumentMetadata {
    source: string;
    page?: number;
    chunk: number;
    totalChunks: number;
    title?: string;
    article?: string;
    chapter?: string;
  }
  
  export interface EmbeddingDocument {
    id?: number;
    content: string;
    embedding: number[];
    metadata: DocumentMetadata;
    created_at?: Date;
  }
  
  export interface ChunkOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    preserveParagraphs?: boolean;
  }
  
  export interface OllamaResponse {
    message: {
      content: string;
      role: string;
    };
  }
  
  export interface OllamaEmbeddingResponse {
    embedding: number[];
  }