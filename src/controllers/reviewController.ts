import type { Response } from 'express';
import { reviewService } from '../services/reviewService';
import { catchAsync } from '../utils/catchAsync';
import { BadRequestError, UnauthorizedError } from '../utils/appError';
import type { AuthenticatedRequest } from '../types';

const requireUserId = (req: AuthenticatedRequest): string => {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
};

export const create = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const review = await reviewService.create(userId, req.body);
  res.status(201).json({ status: 'success', data: review });
});

export const listByWorker = catchAsync(async (req, res: Response) => {
  const workerId = req.params.workerId;
  if (!workerId) throw new BadRequestError('workerId required');
  const reviews = await reviewService.listByWorker(workerId);
  res.json({ status: 'success', data: reviews });
});
