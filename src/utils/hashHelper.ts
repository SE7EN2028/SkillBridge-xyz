import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env';

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, env.bcrypt.saltRounds);

export const comparePassword = (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

export const sha256 = (input: string): string =>
  crypto.createHash('sha256').update(input).digest('hex');
