import type { Request, Response } from 'express';
import { adminService } from '../services/adminService';
import { catchAsync } from '../utils/catchAsync';
import { BadRequestError } from '../utils/appError';

export const listUnverifiedWorkers = catchAsync(async (_req: Request, res: Response) => {
  const workers = await adminService.listUnverifiedWorkers();
  res.json({ status: 'success', data: workers });
});

export const verifyWorker = catchAsync(async (req: Request, res: Response) => {
  const workerId = req.params.workerId;
  if (!workerId) throw new BadRequestError('workerId required');
  const { verified } = req.body as { verified?: boolean };
  if (typeof verified !== 'boolean') throw new BadRequestError('verified (boolean) required');
  const worker = await adminService.setWorkerVerified(workerId, verified);
  res.json({ status: 'success', data: worker });
});

export const setUserActive = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!userId) throw new BadRequestError('userId required');
  const { isActive } = req.body as { isActive?: boolean };
  if (typeof isActive !== 'boolean') throw new BadRequestError('isActive (boolean) required');
  await adminService.setUserActive(userId, isActive);
  res.json({ status: 'success' });
});

export const stats = catchAsync(async (_req: Request, res: Response) => {
  const result = await adminService.getStats();
  res.json({ status: 'success', data: result });
});
