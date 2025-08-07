import { Pool } from 'pg';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

export class Database {
  private pool: Pool | null = null;

  async initialize(): Promise<void> {
    try {
      const databaseUrl = config.get().DATABASE_URL;
      
      // Verificar que DATABASE_URL esté configurada
      if (!databaseUrl || databaseUrl.trim() === '') {
        throw new Error('DATABASE_URL no está configurada. Por favor, configura tu cadena de conexión de Digital Ocean en el archivo .env');
      }

      this.pool = new Pool({
        connectionString: databaseUrl,
        ssl: false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Probar conexión
      logger.info('🔄 Conectando a la base de datos...');
      const client = await this.pool.connect();
      
      // Crear extensión pgvector si no existe
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
      
      // Crear tabla de documentos si no existe
      await client.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          embedding vector(1024),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear índice para búsquedas de similitud
      await client.query(`
        CREATE INDEX IF NOT EXISTS documents_embedding_idx 
        ON documents USING hnsw (embedding vector_cosine_ops)
      `);

      client.release();
      logger.info('✅ Base de datos inicializada correctamente');
    } catch (error) {
      logger.error('❌ Error inicializando base de datos:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('DATABASE_URL no está configurada')) {
          logger.error('📝 Instrucciones:');
          logger.error('1. Crea un archivo .env basado en .env.template');
          logger.error('2. Configura DATABASE_URL con tu conexión de Digital Ocean');
          logger.error('3. Formato: postgresql://usuario:password@host:puerto/database');
        } else if (error.message.includes('Connection terminated unexpectedly')) {
          logger.error('🔍 Verifica que:');
          logger.error('• Las credenciales de la base de datos sean correctas');
          logger.error('• El cluster de Digital Ocean esté ejecutándose');
          logger.error('• La conexión SSL esté habilitada en Digital Ocean');
          logger.error('• Tu IP esté en la lista blanca del cluster');
        } else if (error.message.includes('does not support SSL connections')) {
          logger.error('🔍 Problema SSL detectado:');
          logger.error('• Para bases de datos locales: usa postgresql://user:pass@localhost:5432/db');
          logger.error('• Para Digital Ocean: asegúrate de incluir ?sslmode=require en la URL');
          logger.error('• Verifica que tu base de datos soporte SSL');
        }
      }
      
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Base de datos no inicializada');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('Conexión a la base de datos cerrada');
    }
  }

  getPool(): Pool | null {
    return this.pool;
  }
}

export const database = new Database();