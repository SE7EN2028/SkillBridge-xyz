import type { Request } from 'express';
import type { JwtPayload } from '../utils/jwtHelper';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export * from './auth.types';
export * from './worker.types';
export * from './job.types';
export * from './review.types';
