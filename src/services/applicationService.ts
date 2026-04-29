import type { Application, ApplicationStatus, JobStatus } from '@prisma/client';
import {
  applicationRepository,
  type IApplicationRepository,
  type ApplicationWithRelations,
} from '../repositories/applicationRepository';
import { jobRepository, type IJobRepository } from '../repositories/jobRepository';
import { workerRepository, type IWorkerRepository } from '../repositories/workerRepository';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../utils/appError';

export class ApplicationService {
  constructor(
    private readonly applications: IApplicationRepository = applicationRepository,
    private readonly jobs: IJobRepository = jobRepository,
    private readonly workers: IWorkerRepository = workerRepository,
  ) {}

  async apply(workerUserId: string, jobId: string, coverNote?: string): Promise<Application> {
    const job = await this.jobs.findById(jobId);
    if (!job) throw new NotFoundError('Job not found');
    if (job.status !== 'OPEN') throw new BadRequestError('Job is not open for applications');

    const worker = await this.workers.findByUserId(workerUserId);
    if (!worker) throw new NotFoundError('Worker profile not found');

    const exists = await this.applications.exists(jobId, worker.id);
    if (exists) throw new ConflictError('Already applied to this job');

    return this.applications.create(jobId, worker.id, coverNote);
  }

  async listForJob(employerId: string, jobId: string): Promise<ApplicationWithRelations[]> {
    const job = await this.jobs.findById(jobId);
    if (!job) throw new NotFoundError('Job not found');
    if (job.employerId !== employerId) throw new ForbiddenError('Not the job owner');
    return this.applications.findByJob(jobId);
  }

  async listForWorker(workerUserId: string): Promise<ApplicationWithRelations[]> {
    const worker = await this.workers.findByUserId(workerUserId);
    if (!worker) throw new NotFoundError('Worker profile not found');
    return this.applications.findByWorker(worker.id);
  }

  async setStatusByEmployer(
    employerId: string,
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<Application> {
    const app = await this.applications.findById(applicationId);
    if (!app) throw new NotFoundError('Application not found');
    if (app.job.employerId !== employerId) throw new ForbiddenError('Not the job owner');

    this.assertEmployerTransition(app.status, status);
    const updated = await this.applications.setStatus(applicationId, status);

    if (status === 'ACCEPTED') {
      await this.jobs.setStatus(app.jobId, 'IN_PROGRESS' as JobStatus);
    }
    if (status === 'COMPLETED') {
      await this.jobs.setStatus(app.jobId, 'COMPLETED' as JobStatus);
    }
    return updated;
  }

  async cancelByWorker(workerUserId: string, applicationId: string): Promise<Application> {
    const app = await this.applications.findById(applicationId);
    if (!app) throw new NotFoundError('Application not found');
    const worker = await this.workers.findByUserId(workerUserId);
    if (!worker || app.workerProfileId !== worker.id) {
      throw new ForbiddenError('Not the application owner');
    }
    if (app.status !== 'PENDING') {
      throw new BadRequestError('Only pending applications can be cancelled');
    }
    return this.applications.setStatus(applicationId, 'CANCELLED');
  }

  private assertEmployerTransition(current: ApplicationStatus, next: ApplicationStatus): void {
    const allowed: Record<ApplicationStatus, ApplicationStatus[]> = {
      PENDING: ['ACCEPTED', 'REJECTED'],
      ACCEPTED: ['COMPLETED'],
      REJECTED: [],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (!allowed[current].includes(next)) {
      throw new BadRequestError(`Cannot transition from ${current} to ${next}`);
    }
  }
}

export const applicationService = new ApplicationService();
