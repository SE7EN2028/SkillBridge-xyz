import type { Request, Response } from 'express';
import { authService } from '../services/authService';
import { catchAsync } from '../utils/catchAsync';
import { BadRequestError } from '../utils/appError';

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json({ status: 'success', data: result });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json({ status: 'success', data: result });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) throw new BadRequestError('refreshToken required');
  const tokens = await authService.refresh(refreshToken);
  res.json({ status: 'success', data: tokens });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) throw new BadRequestError('refreshToken required');
  await authService.logout(refreshToken);
  res.status(204).send();
});
