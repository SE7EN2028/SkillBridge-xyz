import type { Job, JobStatus } from '@prisma/client';
import { jobRepository, type IJobRepository, type JobWithEmployer } from '../repositories/jobRepository';
import { ForbiddenError, NotFoundError } from '../utils/appError';
import { parsePagination, buildPaginatedResult, type PaginatedResult } from '../utils/pagination';
import type { CreateJobDTO, JobFilters } from '../types/job.types';

export class JobService {
  constructor(private readonly jobs: IJobRepository = jobRepository) {}

  create(employerId: string, data: CreateJobDTO): Promise<Job> {
    return this.jobs.create(employerId, data);
  }

  async getById(id: string): Promise<JobWithEmployer> {
    const job = await this.jobs.findById(id);
    if (!job) throw new NotFoundError('Job not found');
    return job;
  }

  async search(
    filters: JobFilters,
    query: Record<string, unknown>,
  ): Promise<PaginatedResult<JobWithEmployer>> {
    const pagination = parsePagination(query);
    const { data, total } = await this.jobs.search(filters, pagination);
    return buildPaginatedResult(data, total, pagination);
  }

  async setStatus(employerId: string, jobId: string, status: JobStatus): Promise<Job> {
    const job = await this.jobs.findById(jobId);
    if (!job) throw new NotFoundError('Job not found');
    if (job.employerId !== employerId) throw new ForbiddenError('Not the job owner');
    return this.jobs.setStatus(jobId, status);
  }

  async delete(employerId: string, jobId: string): Promise<void> {
    const job = await this.jobs.findById(jobId);
    if (!job) throw new NotFoundError('Job not found');
    if (job.employerId !== employerId) throw new ForbiddenError('Not the job owner');
    await this.jobs.delete(jobId);
  }
}

export const jobService = new JobService();
