import winston from 'winston';
import { config } from '../config/env.js';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

export const logger = winston.createLogger({
  level: config.get().LOG_LEVEL,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: config.isDevelopment ? consoleFormat : logFormat,
    }),
    ...(config.isProduction
      ? [
          new winston.transports.File({ filename: 'error.log', level: 'error' }),
          new winston.transports.File({ filename: 'combined.log' }),
        ]
      : []),
  ],
});