import type { Response } from 'express';
import type { JobStatus } from '@prisma/client';
import { jobService } from '../services/jobService';
import { catchAsync } from '../utils/catchAsync';
import { BadRequestError, UnauthorizedError } from '../utils/appError';
import type { AuthenticatedRequest } from '../types';
import type { JobFilters } from '../types/job.types';

const requireUserId = (req: AuthenticatedRequest): string => {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
};

export const create = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const job = await jobService.create(userId, req.body);
  res.status(201).json({ status: 'success', data: job });
});

export const getById = catchAsync(async (req, res: Response) => {
  const id = req.params.id;
  if (!id) throw new BadRequestError('id required');
  const job = await jobService.getById(id);
  res.json({ status: 'success', data: job });
});

export const search = catchAsync(async (req, res: Response) => {
  const q = req.query;
  const filters: JobFilters = {};
  if (typeof q.skill === 'string') filters.skillRequired = q.skill;
  if (typeof q.skillRequired === 'string') filters.skillRequired = q.skillRequired;
  if (typeof q.city === 'string') filters.city = q.city;
  if (typeof q.status === 'string') filters.status = q.status as JobStatus;
  if (typeof q.employerId === 'string') filters.employerId = q.employerId;

  const result = await jobService.search(filters, q as Record<string, unknown>);
  res.json({ status: 'success', ...result });
});

export const setStatus = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const id = req.params.id;
  const { status } = req.body as { status?: JobStatus };
  if (!id || !status) throw new BadRequestError('id and status required');
  const job = await jobService.setStatus(userId, id, status);
  res.json({ status: 'success', data: job });
});

export const remove = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const id = req.params.id;
  if (!id) throw new BadRequestError('id required');
  await jobService.delete(userId, id);
  res.status(204).send();
});
