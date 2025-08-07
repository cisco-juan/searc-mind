import { database } from '../config/database.js';
import { OllamaService } from './ollamaService.js';
import { logger } from '../utils/logger.js';
import type { DocumentSource, DocumentMetadata } from '../types/index.js';

export class RAGService {
  private ollamaService: OllamaService;

  constructor() {
    this.ollamaService = new OllamaService();
  }

  async addDocument(content: string, metadata: DocumentMetadata): Promise<void> {
    try {
      logger.debug(`Agregando documento: ${content.substring(0, 50)}...`);
      
      // Generar embedding del contenido
      const embedding = await this.ollamaService.generateEmbedding(content);
      
      // Insertar en la base de datos
      await database.query(
        'INSERT INTO documents (content, embedding, metadata) VALUES ($1, $2, $3)',
        [content, JSON.stringify(embedding), metadata]
      );
      
      // Liberar memoria del embedding
      embedding.length = 0;
      
      logger.debug('Documento agregado exitosamente');
    } catch (error) {
      logger.error('Error agregando documento:', error);
      throw error;
    }
  }

  async searchSimilarDocuments(
    query: string, 
    maxResults: number = 5,
    similarityThreshold: number = 0.7
  ): Promise<DocumentSource[]> {
    try {
      logger.debug(`Buscando documentos similares para: ${query}`);
      
      // Generar embedding de la consulta
      const queryEmbedding = await this.ollamaService.generateEmbedding(query);
      
      // Buscar documentos similares usando cosine similarity
      const result = await database.query(`
        SELECT 
          content,
          metadata,
          1 - (embedding <=> $1) as similarity
        FROM documents 
        WHERE 1 - (embedding <=> $1) > $2
        ORDER BY embedding <=> $1
        LIMIT $3
      `, [JSON.stringify(queryEmbedding), similarityThreshold, maxResults]);

      const documents: DocumentSource[] = result.rows.map((row: any) => ({
        content: row.content,
        metadata: row.metadata,
        similarity: row.similarity,
      }));

      logger.debug(`Encontrados ${documents.length} documentos similares`);
      return documents;
    } catch (error) {
      logger.error('Error buscando documentos similares:', error);
      throw error;
    }
  }

  async generateContextualResponse(
    query: string, 
    maxResults: number = 5
  ): Promise<string> {
    try {
      // Buscar documentos relevantes
      const similarDocuments = await this.searchSimilarDocuments(query, maxResults);
      
      if (similarDocuments.length === 0) {
        return await this.ollamaService.generateResponse(query, '');
      }

      // Construir contexto a partir de documentos similares
      const context = similarDocuments
        .map((doc, index) => {
          const articleInfo = doc.metadata.article ? `Artículo ${doc.metadata.article}` : '';
          const chapterInfo = doc.metadata.chapter ? `Capítulo ${doc.metadata.chapter}` : '';
          const sourceInfo = `${articleInfo} ${chapterInfo}`.trim();
          const similarity = Math.round((doc.similarity || 0) * 100);
          
          return `===== DOCUMENTO ${index + 1} =====
FUENTE: ${sourceInfo || 'Documento sin clasificar'}
RELEVANCIA: ${similarity}%
CONTENIDO:
${doc.content}
========================

`;
        })
        .join('');

      logger.debug(`Generando respuesta con contexto de ${similarDocuments.length} documentos`);
      
      // Generar respuesta con contexto
      return await this.ollamaService.generateResponse(query, context);
    } catch (error) {
      logger.error('Error generando respuesta contextual:', error);
      // Fallback: respuesta sin contexto
      return await this.ollamaService.generateResponse(query, '');
    }
  }

  async getStatistics(): Promise<{
    totalDocuments: number;
    lastUpdated: Date | null;
  }> {
    try {
      const result = await database.query(
        'SELECT COUNT(*) as total, MAX(created_at) as last_updated FROM documents'
      );
      
      return {
        totalDocuments: parseInt(result.rows[0].total),
        lastUpdated: result.rows[0].last_updated,
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      return {
        totalDocuments: 0,
        lastUpdated: null,
      };
    }
  }

  async clearDocuments(): Promise<void> {
    try {
      await database.query('DELETE FROM documents');
      logger.info('Todos los documentos han sido eliminados');
    } catch (error) {
      logger.error('Error limpiando documentos:', error);
      throw error;
    }
  }
}