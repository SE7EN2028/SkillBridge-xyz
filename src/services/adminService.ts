import type { WorkerProfile } from '@prisma/client';
import { adminRepository, type IAdminRepository, type UnverifiedWorker, type PlatformStats } from '../repositories/adminRepository';
import { workerRepository, type IWorkerRepository } from '../repositories/workerRepository';
import { userRepository, type IUserRepository } from '../repositories/userRepository';
import { NotFoundError } from '../utils/appError';

export class AdminService {
  constructor(
    private readonly admins: IAdminRepository = adminRepository,
    private readonly workers: IWorkerRepository = workerRepository,
    private readonly users: IUserRepository = userRepository,
  ) {}

  listUnverifiedWorkers(): Promise<UnverifiedWorker[]> {
    return this.admins.listUnverifiedWorkers();
  }

  async setWorkerVerified(workerProfileId: string, verified: boolean): Promise<WorkerProfile> {
    const worker = await this.workers.findById(workerProfileId);
    if (!worker) throw new NotFoundError('Worker profile not found');
    return this.workers.setVerified(workerProfileId, verified);
  }

  async setUserActive(userId: string, isActive: boolean): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    await this.users.setActive(userId, isActive);
  }

  getStats(): Promise<PlatformStats> {
    return this.admins.getStats();
  }
}

export const adminService = new AdminService();
