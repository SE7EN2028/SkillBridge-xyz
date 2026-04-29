import { WorkerService } from '../../src/services/workerService';
import { ConflictError, ForbiddenError, NotFoundError } from '../../src/utils/appError';
import { parsePagination, buildPaginatedResult } from '../../src/utils/pagination';
import type { IWorkerRepository } from '../../src/repositories/workerRepository';
import type { ISkillRepository } from '../../src/repositories/skillRepository';
import type { Skill, WorkerProfile } from '@prisma/client';

const buildProfile = (overrides: Partial<WorkerProfile> = {}): WorkerProfile => ({
  id: 'wp-1',
  userId: 'u-1',
  bio: null,
  city: 'Pune',
  hourlyRate: 200,
  isAvailable: true,
  isVerified: false,
  averageRating: 0,
  reviewCount: 0,
  photoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const fakeWorkerRepo = (profile: WorkerProfile | null = null): IWorkerRepository => {
  let stored: WorkerProfile | null = profile;
  return {
    findByUserId: jest.fn(async () => stored),
    findById: jest.fn(async (id) => (stored && stored.id === id ? ({ ...stored, user: {} as never, skills: [] }) : null)) as IWorkerRepository['findById'],
    create: jest.fn(async (userId, data) => {
      stored = buildProfile({ userId, city: data.city, hourlyRate: data.hourlyRate });
      return stored;
    }),
    update: jest.fn(async () => stored as WorkerProfile),
    search: jest.fn(),
    setVerified: jest.fn(),
    recomputeRating: jest.fn(),
    setPhotoUrl: jest.fn(),
  };
};

const fakeSkillRepo = (skill: Skill | null = null): ISkillRepository => ({
  add: jest.fn(async (workerProfileId, data) => ({
    id: 's-1',
    workerProfileId,
    skillName: data.skillName,
    yearsExp: data.yearsExp,
    certificateUrl: data.certificateUrl ?? null,
    createdAt: new Date(),
  })),
  remove: jest.fn(async () => undefined),
  listByWorker: jest.fn(async () => []),
  findById: jest.fn(async () => skill),
  setCertificateUrl: jest.fn(),
});

describe('WorkerService', () => {
  it('createProfile rejects duplicates', async () => {
    const svc = new WorkerService(fakeWorkerRepo(buildProfile()), fakeSkillRepo());
    await expect(
      svc.createProfile('u-1', { city: 'Pune', hourlyRate: 100 }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('removeSkill rejects when skill belongs to another worker', async () => {
    const profile = buildProfile();
    const otherSkill: Skill = {
      id: 's-x',
      workerProfileId: 'wp-other',
      skillName: 'plumber',
      yearsExp: 1,
      certificateUrl: null,
      createdAt: new Date(),
    };
    const svc = new WorkerService(fakeWorkerRepo(profile), fakeSkillRepo(otherSkill));
    await expect(svc.removeSkill('u-1', 's-x')).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('updateProfile throws NotFound when missing', async () => {
    const svc = new WorkerService(fakeWorkerRepo(null), fakeSkillRepo());
    await expect(svc.updateProfile('u-1', { city: 'X' })).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('pagination util', () => {
  it('clamps invalid values', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, skip: 0 });
    expect(parsePagination({ page: '-1', limit: '500' })).toEqual({ page: 1, limit: 100, skip: 0 });
    expect(parsePagination({ page: '3', limit: '10' })).toEqual({ page: 3, limit: 10, skip: 20 });
  });

  it('builds paginated result with totalPages', () => {
    const r = buildPaginatedResult([1, 2], 25, { page: 2, limit: 10, skip: 10 });
    expect(r.meta).toEqual({ total: 25, page: 2, limit: 10, totalPages: 3 });
  });
});
