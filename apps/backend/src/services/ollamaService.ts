import { Ollama } from 'ollama';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { OllamaResponse, OllamaEmbeddingResponse } from '../../../../libs/src/types/index.js';

export class OllamaService {
  private ollama: Ollama;
  private chatModel: string;
  private embeddingModel: string;

  constructor() {
    this.ollama = new Ollama({
      host: config.get().OLLAMA_BASE_URL,
    });
    this.chatModel = config.get().OLLAMA_CHAT_MODEL;
    this.embeddingModel = config.get().OLLAMA_EMBEDDING_MODEL;
  }

  async generateResponse(prompt: string, context: string = ''): Promise<string> {
    try {
      // Debug temporal
      logger.debug(`Prompt: ${prompt.substring(0, 100)}...`);
      logger.debug(`Context length: ${context.length}`);
      logger.debug(`Context preview: ${context.substring(0, 200)}...`);
    
      // Si no hay contexto, respuesta simple
      if (!context || context.trim().length === 0) {
        return 'No tengo documentos cargados actualmente. Por favor, sube algunos documentos para que pueda ayudarte con consultas específicas basadas en su contenido.';
      }

      const systemPrompt = `Responde directamente basándote en la siguiente información. Sé conversacional y ve al grano.

${context}

Responde la pregunta del usuario usando esta información de forma natural y directa.`;

      const startTime = Date.now();
      
      const response = await this.ollama.chat({
        model: this.chatModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        options: {
          temperature: 0.4,
          top_p: 0.9,
          top_k: 40,
        },
        stream: false,
      }) as OllamaResponse;

      const processingTime = Date.now() - startTime;
      logger.debug(`Respuesta generada en ${processingTime}ms`);

      return response.message.content;
    } catch (error) {
      logger.error('Error generando respuesta con Ollama:', error);
      throw new Error('Error al generar respuesta del modelo de lenguaje');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.ollama.embeddings({
        model: this.embeddingModel,
        prompt: text,
      }) as OllamaEmbeddingResponse;

      return response.embedding;
    } catch (error) {
      logger.error('Error generando embedding:', error);
      throw new Error('Error al generar embedding del texto');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.ollama.list();
      const chatModelAvailable = response.models.some((m: any) => m.name.includes(this.chatModel.split(':')[0]));
      const embeddingModelAvailable = response.models.some((m: any) => m.name.includes(this.embeddingModel.split(':')[0]));
      return chatModelAvailable && embeddingModelAvailable;
    } catch (error) {
      logger.error('Error verificando salud de Ollama:', error);
      return false;
    }
  }
}