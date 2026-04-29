import type { Response } from 'express';
import type { ApplicationStatus } from '@prisma/client';
import { applicationService } from '../services/applicationService';
import { catchAsync } from '../utils/catchAsync';
import { BadRequestError, UnauthorizedError } from '../utils/appError';
import type { AuthenticatedRequest } from '../types';

const requireUserId = (req: AuthenticatedRequest): string => {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
};

export const apply = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const jobId = req.params.jobId;
  if (!jobId) throw new BadRequestError('jobId required');
  const { coverNote } = req.body as { coverNote?: string };
  const app = await applicationService.apply(userId, jobId, coverNote);
  res.status(201).json({ status: 'success', data: app });
});

export const listForJob = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const jobId = req.params.jobId;
  if (!jobId) throw new BadRequestError('jobId required');
  const apps = await applicationService.listForJob(userId, jobId);
  res.json({ status: 'success', data: apps });
});

export const listForWorker = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const apps = await applicationService.listForWorker(userId);
  res.json({ status: 'success', data: apps });
});

export const setStatus = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const id = req.params.id;
  const { status } = req.body as { status?: ApplicationStatus };
  if (!id || !status) throw new BadRequestError('id and status required');
  const app = await applicationService.setStatusByEmployer(userId, id, status);
  res.json({ status: 'success', data: app });
});

export const cancel = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const id = req.params.id;
  if (!id) throw new BadRequestError('id required');
  const app = await applicationService.cancelByWorker(userId, id);
  res.json({ status: 'success', data: app });
});
