import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level}] ${stack ?? message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: env.log.level,
  format: env.isProd
    ? combine(timestamp(), errors({ stack: true }), json())
    : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), devFormat),
  transports: [new winston.transports.Console()],
  silent: env.isTest,
});
