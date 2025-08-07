import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OllamaService } from '../services/ollamaService.js';
import { RAGService } from '../services/ragService.js';
import { logger } from '../utils/logger.js';
import type { QueryResponse } from '../types/index.js';
import { DocumentLoader } from '../services/documentLoader.js';
import multer from 'multer';
import path from 'path';

const querySchema = z.object({
  query: z.string().min(1).max(1000),
  maxResults: z.number().min(1).max(20).optional().default(5),
  includeMetadata: z.boolean().optional().default(true),
});

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, TXT y MD'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

export class AgentController {
  private ollamaService: OllamaService;
  private ragService: RAGService;
  private documentLoader: DocumentLoader;

  constructor() {
    this.ollamaService = new OllamaService();
    this.ragService = new RAGService();
    this.documentLoader = new DocumentLoader();
  }

  // Middleware para upload
  getUploadMiddleware() {
    return upload.single('document');
  }

  async handleQuery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = querySchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: validation.error?.issues,
        });
        return;
      }

      const { query, maxResults } = validation.data;
      
      logger.info(`📝 Procesando consulta: ${query.substring(0, 50)}...`);
      
      const startTime = Date.now();
      const aiResponse = await this.ragService.generateContextualResponse(query, maxResults || 5);
      const processingTime = Date.now() - startTime;
      
      const response: QueryResponse = {
        success: true,
        query: query,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        processingTime: processingTime,
      };

      res.json(response);
    } catch (error) {
      logger.error('Error procesando consulta:', error);
      next(error);
    }
  }

  async handleHealth(_req: Request, res: Response): Promise<void> {
    try {
      const ollamaHealthy = await this.ollamaService.checkHealth();
      const stats = await this.ragService.getStatistics();
      
      res.json({
        status: ollamaHealthy ? 'healthy' : 'degraded',
        service: 'Agente Código Penal RD',
        components: {
          ollama: ollamaHealthy ? 'operational' : 'unavailable',
          database: 'operational',
        },
        statistics: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error en health check:', error);
      res.status(503).json({
        status: 'unhealthy',
        error: 'Error verificando estado del servicio',
      });
    }
  }

  async handleStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.ragService.getStatistics();
      
      res.json({
        success: true,
        ...stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas',
      });
    }
  }

  async handleUploadDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No se recibió ningún archivo'
        });
        return;
      }

      const filePath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      logger.info(`📄 Procesando archivo: ${req.file.originalname}`);

      // Cargar documento según su tipo
      if (fileExtension === '.pdf') {
        await this.documentLoader.loadPDF(filePath);
      } else if (['.txt', '.md'].includes(fileExtension)) {
        await this.documentLoader.loadTextFile(filePath);
      }

      // Eliminar archivo temporal
      const fs = await import('fs/promises');
      await fs.unlink(filePath);

      const stats = await this.ragService.getStatistics();

      res.json({
        success: true,
        message: 'Documento cargado exitosamente',
        filename: req.file.originalname,
        totalDocuments: stats.totalDocuments,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      logger.error('Error cargando documento:', error);
      
      // Limpiar archivo en caso de error
      if (req.file?.path) {
        try {
          const fs = await import('fs/promises');
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          logger.error('Error limpiando archivo temporal:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Error procesando el documento',
      });
    }
  }

  async handleClearDocuments(_req: Request, res: Response): Promise<void> {
    try {
      await this.ragService.clearDocuments();
      
      res.json({
        success: true,
        message: 'Todos los documentos han sido eliminados',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error limpiando documentos:', error);
      res.status(500).json({
        success: false,
        error: 'Error limpiando documentos',
      });
    }
  }
}