import { buildApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { disconnectDb, prisma } from './config/database';

const start = async (): Promise<void> => {
  await prisma.$connect();
  const app = buildApp();
  const server = app.listen(env.port, () => {
    logger.info(`SkillBridge API listening on :${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal: string): void => {
    logger.info(`Received ${signal}, shutting down`);
    server.close(async () => {
      await disconnectDb();
      logger.info('Server closed');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  ['SIGTERM', 'SIGINT'].forEach((sig) => process.on(sig, () => shutdown(sig)));
  process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', { reason }));
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', err);
    process.exit(1);
  });
};

start().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
