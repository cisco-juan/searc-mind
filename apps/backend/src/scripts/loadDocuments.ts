import path from 'path';
import { DocumentLoader } from '../services/documentLoader.js';
import { logger } from '../utils/logger.js';
import { database } from '../config/database.js';

async function main() {
  try {
    logger.info('🚀 Iniciando carga de documentos...');
    
    // Inicializar base de datos
    await database.initialize();
    
    const loader = new DocumentLoader();
    
    // Obtener directorio de documentos desde argumentos o usar por defecto
    const documentsDir = process.argv[2] || './documents';
    const resolvedPath = path.resolve(documentsDir);
    
    logger.info(`📁 Buscando documentos en: ${resolvedPath}`);
    
    // Cargar todos los documentos del directorio
    await loader.loadDirectory(resolvedPath, {
      chunkSize: 1000,
      chunkOverlap: 500,
      preserveParagraphs: true,
    });
    
    logger.info('✅ Carga de documentos completada');
  } catch (error) {
    logger.error('❌ Error durante la carga de documentos:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

main();