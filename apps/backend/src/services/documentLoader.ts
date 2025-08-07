import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import { logger } from '../utils/logger.js';
import type { ChunkOptions, DocumentMetadata } from '../../../../libs/src/types/index.js';
import { RAGService } from './ragService.js';

export class DocumentLoader {
  private ragService: RAGService;
  private defaultChunkOptions: Required<ChunkOptions> = {
    chunkSize: 1000,
    chunkOverlap: 200,
    preserveParagraphs: true,
  };

  constructor() {
    this.ragService = new RAGService();
  }

  private splitTextIntoChunks(
    text: string, 
    options: ChunkOptions = {}
  ): string[] {
    const opts = { ...this.defaultChunkOptions, ...options };
    const chunks: string[] = [];
    
    if (opts.preserveParagraphs) {
      // Dividir por párrafos primero
      const paragraphs = text.split(/\n\n+/);
      let currentChunk = '';
      
      for (const paragraph of paragraphs) {
        if ((currentChunk + paragraph).length <= opts.chunkSize) {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        } else {
          if (currentChunk) chunks.push(currentChunk);
          
          // Si el párrafo es muy largo, dividirlo
          if (paragraph.length > opts.chunkSize) {
            const subChunks = this.splitLongText(paragraph, opts);
            chunks.push(...subChunks);
            currentChunk = '';
          } else {
            currentChunk = paragraph;
          }
        }
      }
      
      if (currentChunk) chunks.push(currentChunk);
    } else {
      chunks.push(...this.splitLongText(text, opts));
    }
    
    return chunks;
  }

  private splitLongText(
    text: string, 
    options: Required<ChunkOptions>
  ): string[] {
    const chunks: string[] = [];
    let start = 0;
    
    // Validar que chunkOverlap no sea mayor o igual a chunkSize
    const overlap = Math.min(options.chunkOverlap, options.chunkSize - 1);
    
    while (start < text.length) {
      const end = Math.min(start + options.chunkSize, text.length);
      chunks.push(text.substring(start, end));
      
      // Si llegamos al final del texto, salir del bucle
      if (end >= text.length) {
        break;
      }
      
      // Avanzar al menos 1 carácter para evitar bucle infinito
      start = Math.max(start + 1, end - overlap);
    }
    
    return chunks;
  }

  private extractArticleInfo(text: string): Partial<DocumentMetadata> {
    const articleMatch = text.match(/Art[íi]culo\s+(\d+)/i);
    const chapterMatch = text.match(/Cap[íi]tulo\s+([IVXLCDM]+|\d+)/i);
    const titleMatch = text.match(/T[íi]tulo\s+([IVXLCDM]+|\d+)/i);
    
    return {
      article: articleMatch ? articleMatch[1] : undefined,
      chapter: chapterMatch ? chapterMatch[1] : undefined,
      title: titleMatch ? titleMatch[1] : undefined,
    };
  }

  // Método para procesar PDF desde buffer (para uploads)
  async loadPDFFromBuffer(buffer: Buffer, fileName: string, options?: ChunkOptions): Promise<void> {
    try {
      logger.info(`📄 Procesando PDF desde buffer: ${fileName}`);
      
      const data = await pdf(buffer);
      
      logger.info(`📊 Tamaño del texto extraído: ${Math.round(data.text.length / 1024)} KB`);
      
      const chunks = this.splitTextIntoChunks(data.text, options);
      
      logger.info(`🧩 Dividido en ${chunks.length} chunks`);
      
      // Procesar chunks en lotes pequeños para evitar problemas de memoria
      const batchSize = 3;
      const totalBatches = Math.ceil(chunks.length / batchSize);
      
      for (let batch = 0; batch < totalBatches; batch++) {
        const startIdx = batch * batchSize;
        const endIdx = Math.min(startIdx + batchSize, chunks.length);
        const batchChunks = chunks.slice(startIdx, endIdx);
        
        logger.info(`📦 Procesando lote ${batch + 1}/${totalBatches} (chunks ${startIdx + 1}-${endIdx})`);
        
        // Procesar lote actual
        for (let i = 0; i < batchChunks.length; i++) {
          const globalIndex = startIdx + i;
          const chunk = batchChunks[i];
          
          const extractedInfo = this.extractArticleInfo(chunk);
          
          const metadata: DocumentMetadata = {
            source: fileName,
            page: Math.floor(globalIndex * (this.defaultChunkOptions.chunkSize) / 3000) + 1,
            chunk: globalIndex + 1,
            totalChunks: chunks.length,
            ...extractedInfo,
          };
          
          await this.ragService.addDocument(chunk, metadata);
        }
        
        // Forzar garbage collection entre lotes
        if (global.gc) {
          global.gc();
        }
        
        // Pausa pequeña para liberar memoria
        await new Promise(resolve => setTimeout(resolve, 100));
        
        logger.info(`✅ Lote ${batch + 1}/${totalBatches} completado`);
      }
      
      logger.info(`✅ PDF procesado completamente: ${chunks.length} chunks de ${fileName}`);
    } catch (error) {
      logger.error(`Error procesando PDF desde buffer ${fileName}:`, error);
      throw error;
    }
  }

  // Método para procesar texto desde buffer (para uploads)
  async loadTextFromBuffer(buffer: Buffer, fileName: string, options?: ChunkOptions): Promise<void> {
    try {
      logger.info(`📄 Procesando archivo de texto desde buffer: ${fileName}`);
      
      const text = buffer.toString('utf-8');
      const chunks = this.splitTextIntoChunks(text, options);
      
      for (let i = 0; i < chunks.length; i++) {
        const extractedInfo = this.extractArticleInfo(chunks[i]);
        
        const metadata: DocumentMetadata = {
          source: fileName,
          chunk: i + 1,
          totalChunks: chunks.length,
          ...extractedInfo,
        };
        
        await this.ragService.addDocument(chunks[i], metadata);
      }
      
      logger.info(`✅ Archivo procesado: ${chunks.length} chunks de ${fileName}`);
    } catch (error) {
      logger.error(`Error procesando archivo de texto desde buffer ${fileName}:`, error);
      throw error;
    }
  }

  async loadPDF(filePath: string, options?: ChunkOptions): Promise<void> {
    try {
      logger.info(`📄 Cargando PDF: ${filePath}`);
      
      const dataBuffer = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      
      await this.loadPDFFromBuffer(dataBuffer, fileName, options);
      
      // Liberar buffer inmediatamente
      dataBuffer.fill(0);
    } catch (error) {
      logger.error(`Error cargando PDF ${filePath}:`, error);
      throw error;
    }
  }

  async loadTextFile(filePath: string, options?: ChunkOptions): Promise<void> {
    try {
      logger.info(`📄 Cargando archivo de texto: ${filePath}`);
      
      const buffer = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      
      await this.loadTextFromBuffer(buffer, fileName, options);
    } catch (error) {
      logger.error(`Error cargando archivo de texto ${filePath}:`, error);
      throw error;
    }
  }

  async loadDirectory(dirPath: string, options?: ChunkOptions): Promise<void> {
    try {
      const files = await fs.readdir(dirPath);
      const supportedExtensions = ['.pdf', '.txt', '.md'];
      
      const filesToLoad = files.filter(file => 
        supportedExtensions.includes(path.extname(file).toLowerCase())
      );
      
      logger.info(`Encontrados ${filesToLoad.length} archivos para cargar`);
      
      for (const file of filesToLoad) {
        const filePath = path.join(dirPath, file);
        const ext = path.extname(file).toLowerCase();
        
        try {
          if (ext === '.pdf') {
            await this.loadPDF(filePath, options);
          } else if (['.txt', '.md'].includes(ext)) {
            await this.loadTextFile(filePath, options);
          }
        } catch (error) {
          logger.error(`Error procesando ${file}, continuando con el siguiente...`);
        }
      }
      
      logger.info('✅ Todos los documentos han sido procesados');
    } catch (error) {
      logger.error('Error cargando directorio:', error);
      throw error;
    }
  }
}