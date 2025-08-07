import { Ollama } from 'ollama';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { OllamaResponse, OllamaEmbeddingResponse } from '../types/index.js';

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
      const systemPrompt = `Eres un asistente personal que ayuda a resolver las dudas del usuario basándote EXCLUSIVAMENTE en los documentos que el usuario ha cargado.

        INSTRUCCIONES IMPORTANTES:
        1. SOLO puedes responder con información que esté EXPLÍCITAMENTE presente en el contexto proporcionado
        2. Si la información solicitada NO está en el contexto, debes responder: "No tengo información suficiente en los documentos cargados para responder esta pregunta"
        3. NUNCA inventes, asumas o proporciones información que no esté en el contexto
        4. Cita siempre las referencias cuando sea posible
        5. Responde en español, de manera clara y profesional
        6. Si hay múltiples referencias relevantes, menciónalas todas

        ${context ? `CONTEXTO DE LOS DOCUMENTOS CARGADOS:
        ${context}

        Recuerda: SOLO usa la información del contexto anterior para responder.` : 'No hay documentos cargados actualmente. Responde que necesitas que el usuario cargue documentos primero.'}`;

      const startTime = Date.now();
      
      const response = await this.ollama.chat({
        model: this.chatModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        options: {
          temperature: 0.2,
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