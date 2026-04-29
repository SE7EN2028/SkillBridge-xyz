import type { Prisma, PrismaClient, WorkerProfile } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';
import type { CreateWorkerDTO, UpdateWorkerDTO, WorkerFilters } from '../types/worker.types';
import type { PaginationParams } from '../utils/pagination';

export type WorkerWithUserSkills = Prisma.WorkerProfileGetPayload<{
  include: { user: true; skills: true };
}>;

export interface IWorkerRepository {
  findByUserId(userId: string): Promise<WorkerProfile | null>;
  findById(id: string): Promise<WorkerWithUserSkills | null>;
  create(userId: string, data: CreateWorkerDTO): Promise<WorkerProfile>;
  update(userId: string, data: UpdateWorkerDTO): Promise<WorkerProfile>;
  search(filters: WorkerFilters, pagination: PaginationParams): Promise<{ data: WorkerWithUserSkills[]; total: number }>;
  setVerified(id: string, isVerified: boolean): Promise<WorkerProfile>;
  recomputeRating(id: string, average: number, reviewCount: number): Promise<WorkerProfile>;
  setPhotoUrl(userId: string, url: string): Promise<WorkerProfile>;
}

export class WorkerRepository implements IWorkerRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  findByUserId(userId: string): Promise<WorkerProfile | null> {
    return this.db.workerProfile.findUnique({ where: { userId } });
  }

  findById(id: string): Promise<WorkerWithUserSkills | null> {
    return this.db.workerProfile.findUnique({
      where: { id },
      include: { user: true, skills: true },
    });
  }

  create(userId: string, data: CreateWorkerDTO): Promise<WorkerProfile> {
    return this.db.workerProfile.create({
      data: { userId, city: data.city, hourlyRate: data.hourlyRate, bio: data.bio ?? null },
    });
  }

  update(userId: string, data: UpdateWorkerDTO): Promise<WorkerProfile> {
    return this.db.workerProfile.update({ where: { userId }, data });
  }

  async search(
    filters: WorkerFilters,
    pagination: PaginationParams,
  ): Promise<{ data: WorkerWithUserSkills[]; total: number }> {
    const where: Prisma.WorkerProfileWhereInput = {};

    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.maxRate !== undefined) where.hourlyRate = { lte: filters.maxRate };
    if (filters.minRating !== undefined) where.averageRating = { gte: filters.minRating };
    if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;
    if (filters.isAvailable !== undefined) where.isAvailable = filters.isAvailable;
    if (filters.skill) {
      where.skills = { some: { skillName: { contains: filters.skill, mode: 'insensitive' } } };
    }

    const [data, total] = await this.db.$transaction([
      this.db.workerProfile.findMany({
        where,
        include: { user: true, skills: true },
        orderBy: [{ averageRating: 'desc' }, { createdAt: 'desc' }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.db.workerProfile.count({ where }),
    ]);

    return { data, total };
  }

  setVerified(id: string, isVerified: boolean): Promise<WorkerProfile> {
    return this.db.workerProfile.update({ where: { id }, data: { isVerified } });
  }

  recomputeRating(id: string, average: number, reviewCount: number): Promise<WorkerProfile> {
    return this.db.workerProfile.update({
      where: { id },
      data: { averageRating: average, reviewCount },
    });
  }

  setPhotoUrl(userId: string, url: string): Promise<WorkerProfile> {
    return this.db.workerProfile.update({ where: { userId }, data: { photoUrl: url } });
  }
}

export const workerRepository = new WorkerRepository();
