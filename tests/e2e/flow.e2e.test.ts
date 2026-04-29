import request from 'supertest';

jest.mock('../../src/services/authService', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  },
}));
jest.mock('../../src/services/workerService', () => ({
  workerService: {
    createProfile: jest.fn(),
    updateProfile: jest.fn(),
    getById: jest.fn(),
    getByUserId: jest.fn(),
    search: jest.fn(),
    addSkill: jest.fn(),
    removeSkill: jest.fn(),
    uploadPhoto: jest.fn(),
  },
}));
jest.mock('../../src/services/jobService', () => ({
  jobService: {
    create: jest.fn(),
    getById: jest.fn(),
    search: jest.fn(),
    setStatus: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('../../src/services/applicationService', () => ({
  applicationService: {
    apply: jest.fn(),
    listForJob: jest.fn(),
    listForWorker: jest.fn(),
    setStatusByEmployer: jest.fn(),
    cancelByWorker: jest.fn(),
  },
}));
jest.mock('../../src/services/reviewService', () => ({
  reviewService: {
    create: jest.fn(),
    listByWorker: jest.fn(),
  },
}));

import { buildApp } from '../../src/app';
import { authService } from '../../src/services/authService';
import { workerService } from '../../src/services/workerService';
import { jobService } from '../../src/services/jobService';
import { applicationService } from '../../src/services/applicationService';
import { reviewService } from '../../src/services/reviewService';
import { jwtHelper } from '../../src/utils/jwtHelper';

const app = buildApp();

describe('E2E: hire flow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('worker register → create profile → employer post job → worker applies → employer accepts → completes → reviews', async () => {
    const workerToken = jwtHelper.signAccessToken({ sub: 'wu-1', role: 'WORKER' });
    const employerToken = jwtHelper.signAccessToken({ sub: 'emp-1', role: 'EMPLOYER' });

    (authService.register as jest.Mock).mockResolvedValue({
      accessToken: workerToken,
      refreshToken: 'r1',
      user: { id: 'wu-1', name: 'W', email: 'w@x.com', role: 'WORKER' },
    });
    let res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Worker One', email: 'worker1@example.com', password: 'password123', role: 'WORKER' });
    expect(res.status).toBe(201);

    (workerService.createProfile as jest.Mock).mockResolvedValue({ id: 'wp-1', userId: 'wu-1' });
    res = await request(app)
      .post('/api/v1/workers')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ city: 'Mumbai', hourlyRate: 250 });
    expect(res.status).toBe(201);

    (jobService.create as jest.Mock).mockResolvedValue({ id: 'job-1', employerId: 'emp-1' });
    res = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ title: 'Pipe leak fix needed', skillRequired: 'plumber', city: 'Mumbai', budget: 1500 });
    expect(res.status).toBe(201);

    (applicationService.apply as jest.Mock).mockResolvedValue({ id: 'app-1', status: 'PENDING' });
    res = await request(app)
      .post('/api/v1/jobs/job-1/applications')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ coverNote: 'I can do this' });
    expect(res.status).toBe(201);

    (applicationService.setStatusByEmployer as jest.Mock).mockResolvedValue({ id: 'app-1', status: 'ACCEPTED' });
    res = await request(app)
      .patch('/api/v1/applications/app-1/status')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ status: 'ACCEPTED' });
    expect(res.status).toBe(200);

    (applicationService.setStatusByEmployer as jest.Mock).mockResolvedValue({ id: 'app-1', status: 'COMPLETED' });
    res = await request(app)
      .patch('/api/v1/applications/app-1/status')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);

    (reviewService.create as jest.Mock).mockResolvedValue({ id: 'rev-1', rating: 5 });
    res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ applicationId: '550e8400-e29b-41d4-a716-446655440000', rating: 5, comment: 'Excellent' });
    expect(res.status).toBe(201);
  });
});
