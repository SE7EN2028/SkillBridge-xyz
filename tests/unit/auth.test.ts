import { AuthService } from '../../src/services/authService';
import { ConflictError, UnauthorizedError } from '../../src/utils/appError';
import { hashPassword } from '../../src/utils/hashHelper';
import type { IUserRepository } from '../../src/repositories/userRepository';
import type { IRefreshTokenRepository } from '../../src/repositories/refreshTokenRepository';
import type { User, RefreshToken, Role } from '@prisma/client';

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  name: 'Alice',
  email: 'alice@test.com',
  passwordHash: 'hash',
  role: 'WORKER' as Role,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const fakeUserRepo = (initial: User | null = null): IUserRepository => {
  let stored: User | null = initial;
  return {
    findById: jest.fn(async () => stored),
    findByEmail: jest.fn(async (email: string) => (stored && stored.email === email.toLowerCase() ? stored : null)),
    create: jest.fn(async (data) => {
      stored = buildUser({ ...data, id: 'new-user' });
      return stored;
    }),
    update: jest.fn(async () => stored as User),
    delete: jest.fn(async () => undefined),
    setActive: jest.fn(async (_, isActive) => ({ ...(stored as User), isActive })),
  };
};

const fakeTokenRepo = (): IRefreshTokenRepository => {
  const tokens = new Map<string, RefreshToken>();
  return {
    create: jest.fn(async (userId, tokenHash, expiresAt) => {
      const t: RefreshToken = {
        id: `t-${tokens.size + 1}`,
        userId,
        tokenHash,
        expiresAt,
        revoked: false,
        createdAt: new Date(),
      };
      tokens.set(tokenHash, t);
      return t;
    }),
    findByHash: jest.fn(async (hash) => tokens.get(hash) ?? null),
    revoke: jest.fn(async (id) => {
      for (const t of tokens.values()) {
        if (t.id === id) t.revoked = true;
      }
    }),
    revokeAllForUser: jest.fn(async () => undefined),
  };
};

describe('AuthService', () => {
  describe('register', () => {
    it('creates a new user and issues tokens', async () => {
      const users = fakeUserRepo();
      const tokens = fakeTokenRepo();
      const svc = new AuthService(users, tokens);
      const result = await svc.register({
        name: 'Alice',
        email: 'Alice@Test.COM',
        password: 'password123',
        role: 'WORKER',
      });
      expect(result.user.email).toBe('alice@test.com');
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(tokens.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictError if email exists', async () => {
      const existing = buildUser({ email: 'taken@test.com' });
      const users = fakeUserRepo(existing);
      const svc = new AuthService(users, fakeTokenRepo());
      await expect(
        svc.register({ name: 'A', email: 'taken@test.com', password: 'x12345678', role: 'WORKER' }),
      ).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe('login', () => {
    it('returns tokens on valid credentials', async () => {
      const passwordHash = await hashPassword('password123');
      const user = buildUser({ passwordHash });
      const users = fakeUserRepo(user);
      const svc = new AuthService(users, fakeTokenRepo());
      const result = await svc.login({ email: user.email, password: 'password123' });
      expect(result.user.id).toBe(user.id);
    });

    it('rejects bad password', async () => {
      const passwordHash = await hashPassword('password123');
      const users = fakeUserRepo(buildUser({ passwordHash }));
      const svc = new AuthService(users, fakeTokenRepo());
      await expect(svc.login({ email: 'alice@test.com', password: 'wrong' })).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
    });

    it('rejects inactive user', async () => {
      const passwordHash = await hashPassword('password123');
      const users = fakeUserRepo(buildUser({ passwordHash, isActive: false }));
      const svc = new AuthService(users, fakeTokenRepo());
      await expect(
        svc.login({ email: 'alice@test.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });

  describe('refresh', () => {
    it('rotates tokens', async () => {
      const passwordHash = await hashPassword('password123');
      const user = buildUser({ passwordHash });
      const users = fakeUserRepo(user);
      const tokens = fakeTokenRepo();
      const svc = new AuthService(users, tokens);
      const auth = await svc.login({ email: user.email, password: 'password123' });
      const refreshed = await svc.refresh(auth.refreshToken);
      expect(refreshed.accessToken).toBeTruthy();
      expect(refreshed.refreshToken).not.toBe(auth.refreshToken);
    });

    it('rejects revoked token', async () => {
      const passwordHash = await hashPassword('password123');
      const user = buildUser({ passwordHash });
      const users = fakeUserRepo(user);
      const tokens = fakeTokenRepo();
      const svc = new AuthService(users, tokens);
      const auth = await svc.login({ email: user.email, password: 'password123' });
      await svc.refresh(auth.refreshToken);
      await expect(svc.refresh(auth.refreshToken)).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });
});
