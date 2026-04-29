import type { Prisma, PrismaClient, Application, ApplicationStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';

export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: {
    job: true;
    workerProfile: { include: { user: { select: { id: true; name: true } } } };
  };
}>;

export interface IApplicationRepository {
  create(jobId: string, workerProfileId: string, coverNote?: string): Promise<Application>;
  findById(id: string): Promise<ApplicationWithRelations | null>;
  findByJob(jobId: string): Promise<ApplicationWithRelations[]>;
  findByWorker(workerProfileId: string): Promise<ApplicationWithRelations[]>;
  setStatus(id: string, status: ApplicationStatus): Promise<Application>;
  exists(jobId: string, workerProfileId: string): Promise<boolean>;
}

export class ApplicationRepository implements IApplicationRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  create(jobId: string, workerProfileId: string, coverNote?: string): Promise<Application> {
    return this.db.application.create({
      data: { jobId, workerProfileId, coverNote: coverNote ?? null },
    });
  }

  findById(id: string): Promise<ApplicationWithRelations | null> {
    return this.db.application.findUnique({
      where: { id },
      include: {
        job: true,
        workerProfile: { include: { user: { select: { id: true, name: true } } } },
      },
    });
  }

  findByJob(jobId: string): Promise<ApplicationWithRelations[]> {
    return this.db.application.findMany({
      where: { jobId },
      include: {
        job: true,
        workerProfile: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByWorker(workerProfileId: string): Promise<ApplicationWithRelations[]> {
    return this.db.application.findMany({
      where: { workerProfileId },
      include: {
        job: true,
        workerProfile: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  setStatus(id: string, status: ApplicationStatus): Promise<Application> {
    return this.db.application.update({ where: { id }, data: { status } });
  }

  async exists(jobId: string, workerProfileId: string): Promise<boolean> {
    const count = await this.db.application.count({ where: { jobId, workerProfileId } });
    return count > 0;
  }
}

export const applicationRepository = new ApplicationRepository();
