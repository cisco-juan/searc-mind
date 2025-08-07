import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  OLLAMA_CHAT_MODEL: z.string().default('gemma3:1b'),
  OLLAMA_EMBEDDING_MODEL: z.string().default('nomic-embed-text'),
  DATABASE_URL: z.string().min(1),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

class ConfigManager {
  private config: EnvConfig;

  constructor() {
    try {
      this.config = envSchema.parse(process.env);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        console.error('❌ Error en configuración de variables de entorno:');
        console.error(error?.issues);
        process.exit(1);
      }
      throw error;
    }
  }

  get(): EnvConfig {
    return this.config;
  }

  get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }
}

export const config = new ConfigManager();