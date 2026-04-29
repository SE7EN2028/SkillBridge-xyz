import request from 'supertest';

jest.mock('../../src/services/authService', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  },
}));

import { buildApp } from '../../src/app';
import { authService } from '../../src/services/authService';

const app = buildApp();

describe('Auth routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/v1/auth/register', () => {
    it('rejects invalid payload (422)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'bad', password: 'short', role: 'WORKER' });
      expect(res.status).toBe(422);
      expect(res.body.status).toBe('error');
    });

    it('returns 201 + tokens on success', async () => {
      (authService.register as jest.Mock).mockResolvedValue({
        accessToken: 'a',
        refreshToken: 'r',
        user: { id: 'u', name: 'Alice', email: 'alice@test.com', role: 'WORKER' },
      });
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Alice', email: 'alice@test.com', password: 'password123', role: 'WORKER' });
      expect(res.status).toBe(201);
      expect(res.body.data.accessToken).toBe('a');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 200 on success', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        accessToken: 'a',
        refreshToken: 'r',
        user: { id: 'u', name: 'Alice', email: 'alice@test.com', role: 'WORKER' },
      });
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'alice@test.com', password: 'password123' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('rotates token', async () => {
      (authService.refresh as jest.Mock).mockResolvedValue({ accessToken: 'a2', refreshToken: 'r2' });
      const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: 'r' });
      expect(res.status).toBe(200);
      expect(res.body.data.refreshToken).toBe('r2');
    });
  });

  describe('GET /api/v1/health', () => {
    it('returns ok', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
