process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret';
process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/skillbridge_test';
process.env.BCRYPT_SALT_ROUNDS ??= '4';
process.env.LOG_LEVEL ??= 'silent';
