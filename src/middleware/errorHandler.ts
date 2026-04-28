import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/appError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ValidationError) {
    res.status(422).json({
      status: 'error',
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Prisma unique constraint violation
  if ((err as { code?: string }).code === 'P2002') {
    res.status(409).json({
      status: 'error',
      message: 'Resource already exists',
    });
    return;
  }

  // Prisma record not found
  if ((err as { code?: string }).code === 'P2025') {
    res.status(404).json({
      status: 'error',
      message: 'Resource not found',
    });
    return;
  }

  logger.error('Unhandled error:', err);

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(env.isDev && { stack: err.stack }),
  });
};