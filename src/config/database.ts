import { PrismaClient } from '@prisma/client';
import { env } from './env';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev ? ['query', 'error', 'warn'] : ['error'],
  });

if (!env.isProd) {
  globalForPrisma.prisma = prisma;
}

export const disconnectDb = async (): Promise<void> => {
  await prisma.$disconnect();
};
