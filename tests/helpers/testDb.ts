import { prisma } from '../../src/config/database';

export const truncateAll = async (): Promise<void> => {
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.application.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.workerProfile.deleteMany(),
    prisma.job.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};

export const closeDb = async (): Promise<void> => {
  await prisma.$disconnect();
};
