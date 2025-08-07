import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { database } from './config/database.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import agentRoutes from './routes/agentRoutes.js';

const app = express();
const PORT = config.get().PORT;

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas solicitudes, por favor intente más tarde',
});

// Middlewares
app.use(helmet());
app.use(cors({
  origin: config.isDevelopment ? '*' : process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', limiter);

// Request logging
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined,
  });
  next();
});

// Rutas
app.use('/api/agent', agentRoutes);

// Ruta principal
app.get('/', (_req, res) => {
  res.json({
    message: 'API Agente Código Penal Dominicano',
    version: '1.0.0',
    environment: config.get().NODE_ENV,
    endpoints: {
      query: 'POST /api/agent/query',
      health: 'GET /api/agent/health',
      statistics: 'GET /api/agent/statistics',
      upload: 'POST /api/agent/upload',
      clearDocuments: 'DELETE /api/agent/documents',
    },
  });
});


// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path,
  });
});

// Manejo de errores
app.use(errorHandler);

// Inicialización y arranque del servidor
async function startServer() {
  try {
    // Inicializar base de datos
    await database.initialize();
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      logger.info(`📚 Agente SearchMind listo para consultas`);
      logger.info(`🌍 Entorno: ${config.get().NODE_ENV}`);
    });

    // Manejo de señales para shutdown graceful
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} recibida, cerrando servidor gracefully...`);
      
      server.close(() => {
        logger.info('Servidor HTTP cerrado');
      });

      await database.close();
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();