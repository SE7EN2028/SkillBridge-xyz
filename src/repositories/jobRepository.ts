import type { Prisma, PrismaClient, Job, JobStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';
import type { CreateJobDTO, JobFilters } from '../types/job.types';
import type { PaginationParams } from '../utils/pagination';

export type JobWithEmployer = Prisma.JobGetPayload<{
  include: { employer: { select: { id: true; name: true } } };
}>;

export interface IJobRepository {
  create(employerId: string, data: CreateJobDTO): Promise<Job>;
  findById(id: string): Promise<JobWithEmployer | null>;
  search(filters: JobFilters, pagination: PaginationParams): Promise<{ data: JobWithEmployer[]; total: number }>;
  setStatus(id: string, status: JobStatus): Promise<Job>;
  delete(id: string): Promise<void>;
}

export class JobRepository implements IJobRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  create(employerId: string, data: CreateJobDTO): Promise<Job> {
    return this.db.job.create({
      data: {
        employerId,
        title: data.title,
        description: data.description ?? null,
        skillRequired: data.skillRequired,
        city: data.city,
        budget: data.budget,
      },
    });
  }

  findById(id: string): Promise<JobWithEmployer | null> {
    return this.db.job.findUnique({
      where: { id },
      include: { employer: { select: { id: true, name: true } } },
    });
  }

  async search(
    filters: JobFilters,
    pagination: PaginationParams,
  ): Promise<{ data: JobWithEmployer[]; total: number }> {
    const where: Prisma.JobWhereInput = {};
    if (filters.skillRequired)
      where.skillRequired = { contains: filters.skillRequired, mode: 'insensitive' };
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.status) where.status = filters.status;
    if (filters.employerId) where.employerId = filters.employerId;

    const [data, total] = await this.db.$transaction([
      this.db.job.findMany({
        where,
        include: { employer: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.db.job.count({ where }),
    ]);

    return { data, total };
  }

  setStatus(id: string, status: JobStatus): Promise<Job> {
    return this.db.job.update({ where: { id }, data: { status } });
  }

  async delete(id: string): Promise<void> {
    await this.db.job.delete({ where: { id } });
  }
}

export const jobRepository = new JobRepository();
