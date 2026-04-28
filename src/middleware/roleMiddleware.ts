import { Response, NextFunction, RequestHandler } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/appError';
import { AuthenticatedRequest } from '../types';

export const authorize = (...roles: Role[]): RequestHandler => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Not authenticated'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`));
      return;
    }
    next();
  };
};