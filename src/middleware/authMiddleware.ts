import { Response, NextFunction } from 'express';
import { jwtHelper } from '../utils/jwtHelper';
import { UnauthorizedError } from '../utils/appError';
import { AuthenticatedRequest } from '../types';

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedError('No token provided');

    const payload = jwtHelper.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};