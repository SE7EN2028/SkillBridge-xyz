import { ApplicationService } from '../../src/services/applicationService';
import { JobService } from '../../src/services/jobService';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../src/utils/appError';
import type { IApplicationRepository, ApplicationWithRelations } from '../../src/repositories/applicationRepository';
import type { IJobRepository, JobWithEmployer } from '../../src/repositories/jobRepository';
import type { IWorkerRepository } from '../../src/repositories/workerRepository';
import type { Application, Job, JobStatus, ApplicationStatus, WorkerProfile } from '@prisma/client';

const buildJob = (overrides: Partial<JobWithEmployer> = {}): JobWithEmployer => ({
  id: 'job-1',
  employerId: 'emp-1',
  title: 't',
  description: null,
  skillRequired: 'plumber',
  city: 'Mumbai',
  budget: 1000,
  status: 'OPEN' as JobStatus,
  createdAt: new Date(),
  updatedAt: new Date(),
  employer: { id: 'emp-1', name: 'E' },
  ...overrides,
});

const buildWorker = (overrides: Partial<WorkerProfile> = {}): WorkerProfile => ({
  id: 'wp-1',
  userId: 'wu-1',
  bio: null,
  city: 'Mumbai',
  hourlyRate: 100,
  isAvailable: true,
  isVerified: false,
  averageRating: 0,
  reviewCount: 0,
  photoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const fakeJobRepo = (jobs: JobWithEmployer[] = []): IJobRepository => {
  const store = new Map(jobs.map((j) => [j.id, j]));
  return {
    create: jest.fn(),
    findById: jest.fn(async (id: string) => store.get(id) ?? null),
    search: jest.fn(),
    setStatus: jest.fn(async (id, status) => {
      const j = store.get(id) as JobWithEmployer;
      const updated = { ...j, status };
      store.set(id, updated);
      return updated as Job;
    }),
    delete: jest.fn(async () => undefined),
  };
};

const fakeAppRepo = (apps: ApplicationWithRelations[] = []): IApplicationRepository => {
  const store = new Map(apps.map((a) => [a.id, a]));
  return {
    create: jest.fn(async (jobId, workerProfileId, coverNote) => {
      const a: Application = {
        id: `app-${store.size + 1}`,
        jobId,
        workerProfileId,
        status: 'PENDING' as ApplicationStatus,
        coverNote: coverNote ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return a;
    }),
    findById: jest.fn(async (id) => store.get(id) ?? null),
    findByJob: jest.fn(),
    findByWorker: jest.fn(),
    setStatus: jest.fn(async (id, status) => {
      const a = store.get(id) as ApplicationWithRelations;
      const updated = { ...a, status };
      store.set(id, updated);
      return updated;
    }),
    exists: jest.fn(async () => false),
  };
};

const fakeWorkerRepo = (worker: WorkerProfile | null): IWorkerRepository => ({
  findByUserId: jest.fn(async () => worker),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  search: jest.fn(),
  setVerified: jest.fn(),
  recomputeRating: jest.fn(),
  setPhotoUrl: jest.fn(),
});

describe('JobService', () => {
  it('throws when setStatus on non-owned job', async () => {
    const jobs = fakeJobRepo([buildJob()]);
    const svc = new JobService(jobs);
    await expect(svc.setStatus('other-emp', 'job-1', 'COMPLETED')).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it('throws NotFound on missing job', async () => {
    const svc = new JobService(fakeJobRepo());
    await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('ApplicationService', () => {
  it('rejects applying to non-OPEN job', async () => {
    const job = buildJob({ status: 'IN_PROGRESS' as JobStatus });
    const svc = new ApplicationService(fakeAppRepo(), fakeJobRepo([job]), fakeWorkerRepo(buildWorker()));
    await expect(svc.apply('wu-1', 'job-1')).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects when worker has no profile', async () => {
    const svc = new ApplicationService(fakeAppRepo(), fakeJobRepo([buildJob()]), fakeWorkerRepo(null));
    await expect(svc.apply('wu-1', 'job-1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects employer transition PENDING -> COMPLETED', async () => {
    const app: ApplicationWithRelations = {
      id: 'app-1',
      jobId: 'job-1',
      workerProfileId: 'wp-1',
      status: 'PENDING' as ApplicationStatus,
      coverNote: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      job: buildJob(),
      workerProfile: { ...buildWorker(), user: { id: 'wu-1', name: 'W' } } as ApplicationWithRelations['workerProfile'],
    };
    const apps = fakeAppRepo([app]);
    const svc = new ApplicationService(apps, fakeJobRepo([buildJob()]), fakeWorkerRepo(buildWorker()));
    await expect(svc.setStatusByEmployer('emp-1', 'app-1', 'COMPLETED')).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('allows employer transition PENDING -> ACCEPTED and updates job', async () => {
    const app: ApplicationWithRelations = {
      id: 'app-1',
      jobId: 'job-1',
      workerProfileId: 'wp-1',
      status: 'PENDING' as ApplicationStatus,
      coverNote: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      job: buildJob(),
      workerProfile: { ...buildWorker(), user: { id: 'wu-1', name: 'W' } } as ApplicationWithRelations['workerProfile'],
    };
    const apps = fakeAppRepo([app]);
    const jobs = fakeJobRepo([buildJob()]);
    const svc = new ApplicationService(apps, jobs, fakeWorkerRepo(buildWorker()));
    const result = await svc.setStatusByEmployer('emp-1', 'app-1', 'ACCEPTED');
    expect(result.status).toBe('ACCEPTED');
    expect(jobs.setStatus).toHaveBeenCalledWith('job-1', 'IN_PROGRESS');
  });
});
