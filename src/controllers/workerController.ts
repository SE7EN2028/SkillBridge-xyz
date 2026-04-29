import type { Response } from 'express';
import { workerService } from '../services/workerService';
import { catchAsync } from '../utils/catchAsync';
import { BadRequestError, UnauthorizedError } from '../utils/appError';
import type { AuthenticatedRequest } from '../types';
import type { WorkerFilters } from '../types/worker.types';

const requireUserId = (req: AuthenticatedRequest): string => {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
};

export const createProfile = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const profile = await workerService.createProfile(userId, req.body);
  res.status(201).json({ status: 'success', data: profile });
});

export const updateProfile = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const profile = await workerService.updateProfile(userId, req.body);
  res.json({ status: 'success', data: profile });
});

export const getMe = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const profile = await workerService.getByUserId(userId);
  res.json({ status: 'success', data: profile });
});

export const getById = catchAsync(async (req, res: Response) => {
  const id = req.params.id;
  if (!id) throw new BadRequestError('id required');
  const profile = await workerService.getById(id);
  res.json({ status: 'success', data: profile });
});

export const search = catchAsync(async (req, res: Response) => {
  const q = req.query;
  const filters: WorkerFilters = {};
  if (typeof q.skill === 'string') filters.skill = q.skill;
  if (typeof q.city === 'string') filters.city = q.city;
  if (q.minRating !== undefined) filters.minRating = Number(q.minRating);
  if (q.maxRate !== undefined) filters.maxRate = Number(q.maxRate);
  if (q.isVerified !== undefined) filters.isVerified = q.isVerified === 'true';
  if (q.isAvailable !== undefined) filters.isAvailable = q.isAvailable === 'true';

  const result = await workerService.search(filters, q as Record<string, unknown>);
  res.json({ status: 'success', ...result });
});

export const addSkill = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const file = (req as AuthenticatedRequest & { file?: Express.Multer.File }).file;
  const skill = await workerService.addSkill(userId, req.body, file?.buffer);
  res.status(201).json({ status: 'success', data: skill });
});

export const removeSkill = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const skillId = req.params.skillId;
  if (!skillId) throw new BadRequestError('skillId required');
  await workerService.removeSkill(userId, skillId);
  res.status(204).send();
});

export const uploadPhoto = catchAsync(async (req, res: Response) => {
  const userId = requireUserId(req as AuthenticatedRequest);
  const file = (req as AuthenticatedRequest & { file?: Express.Multer.File }).file;
  if (!file) throw new BadRequestError('No file uploaded');
  const profile = await workerService.uploadPhoto(userId, file.buffer);
  res.json({ status: 'success', data: profile });
});
