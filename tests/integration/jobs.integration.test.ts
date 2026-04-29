import request from 'supertest';

jest.mock('../../src/services/jobService', () => ({
  jobService: {
    create: jest.fn(),
    getById: jest.fn(),
    search: jest.fn(),
    setStatus: jest.fn(),
    delete: jest.fn(),
  },
}));

import { buildApp } from '../../src/app';
import { jobService } from '../../src/services/jobService';
import { jwtHelper } from '../../src/utils/jwtHelper';

const app = buildApp();

const employerToken = jwtHelper.signAccessToken({ sub: 'emp-1', role: 'EMPLOYER' });
const workerToken = jwtHelper.signAccessToken({ sub: 'wu-1', role: 'WORKER' });

describe('Job routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/v1/jobs is public', async () => {
    (jobService.search as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    });
    const res = await request(app).get('/api/v1/jobs');
    expect(res.status).toBe(200);
  });

  it('POST /api/v1/jobs requires employer role', async () => {
    const res = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ title: 'Need plumber asap', skillRequired: 'plumber', city: 'Mumbai', budget: 500 });
    expect(res.status).toBe(403);
  });

  it('POST /api/v1/jobs creates with employer token', async () => {
    (jobService.create as jest.Mock).mockResolvedValue({ id: 'j1' });
    const res = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ title: 'Need plumber asap', skillRequired: 'plumber', city: 'Mumbai', budget: 500 });
    expect(res.status).toBe(201);
    expect(jobService.create).toHaveBeenCalledWith('emp-1', expect.any(Object));
  });

  it('POST /api/v1/jobs rejects without auth', async () => {
    const res = await request(app)
      .post('/api/v1/jobs')
      .send({ title: 'x', skillRequired: 'p', city: 'M', budget: 1 });
    expect(res.status).toBe(401);
  });
});
