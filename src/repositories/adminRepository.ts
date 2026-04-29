import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';

export type UnverifiedWorker = Prisma.WorkerProfileGetPayload<{
  include: { user: { select: { id: true; name: true; email: true } }; skills: true };
}>;

export interface PlatformStats {
  totalUsers: number;
  totalWorkers: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  totalCompletedJobs: number;
}

export interface IAdminRepository {
  listUnverifiedWorkers(): Promise<UnverifiedWorker[]>;
  getStats(): Promise<PlatformStats>;
}

export class AdminRepository implements IAdminRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  listUnverifiedWorkers(): Promise<UnverifiedWorker[]> {
    return this.db.workerProfile.findMany({
      where: { isVerified: false },
      include: {
        user: { select: { id: true, name: true, email: true } },
        skills: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getStats(): Promise<PlatformStats> {
    const [totalUsers, totalWorkers, totalEmployers, totalJobs, totalApplications, totalCompletedJobs] =
      await this.db.$transaction([
        this.db.user.count(),
        this.db.user.count({ where: { role: 'WORKER' } }),
        this.db.user.count({ where: { role: 'EMPLOYER' } }),
        this.db.job.count(),
        this.db.application.count(),
        this.db.job.count({ where: { status: 'COMPLETED' } }),
      ]);

    return {
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalJobs,
      totalApplications,
      totalCompletedJobs,
    };
  }
}

export const adminRepository = new AdminRepository();
