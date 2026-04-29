import request from 'supertest';

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

import { buildApp } from '../../src/app';
import { workerService } from '../../src/services/workerService';
import { jwtHelper } from '../../src/utils/jwtHelper';

const app = buildApp();
const workerToken = jwtHelper.signAccessToken({ sub: 'u-1', role: 'WORKER' });
const employerToken = jwtHelper.signAccessToken({ sub: 'e-1', role: 'EMPLOYER' });

describe('Worker routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/v1/workers is public + paginated', async () => {
    (workerService.search as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    });
    const res = await request(app).get('/api/v1/workers?city=Mumbai&minRating=4');
    expect(res.status).toBe(200);
    expect(workerService.search).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'Mumbai', minRating: 4 }),
      expect.any(Object),
    );
  });

  it('POST /api/v1/workers rejects employer', async () => {
    const res = await request(app)
      .post('/api/v1/workers')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ city: 'Pune', hourlyRate: 100 });
    expect(res.status).toBe(403);
  });

  it('POST /api/v1/workers creates with worker role', async () => {
    (workerService.createProfile as jest.Mock).mockResolvedValue({ id: 'wp-1' });
    const res = await request(app)
      .post('/api/v1/workers')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ city: 'Pune', hourlyRate: 100 });
    expect(res.status).toBe(201);
  });

  it('GET /api/v1/workers/me requires auth', async () => {
    const res = await request(app).get('/api/v1/workers/me');
    expect(res.status).toBe(401);
  });
});
