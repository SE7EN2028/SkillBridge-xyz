import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import routes from './routes';
import { env } from './config/env';
import { NotFoundError } from './utils/appError';

export const buildApp = (): Application => {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.cors.origin, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  if (!env.isTest) {
    app.use(morgan(env.isProd ? 'combined' : 'dev'));
  }

  app.use('/api/v1', apiLimiter, routes);

  app.use((req, _res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  app.use(errorHandler);

  return app;
};
