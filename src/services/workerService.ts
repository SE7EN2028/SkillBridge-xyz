import type { Skill, WorkerProfile } from '@prisma/client';
import { workerRepository, type IWorkerRepository, type WorkerWithUserSkills } from '../repositories/workerRepository';
import { skillRepository, type ISkillRepository } from '../repositories/skillRepository';
import { uploadBufferToCloudinary } from '../config/cloudinary';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/appError';
import { parsePagination, buildPaginatedResult, type PaginatedResult } from '../utils/pagination';
import type {
  CreateWorkerDTO,
  UpdateWorkerDTO,
  AddSkillDTO,
  WorkerFilters,
} from '../types/worker.types';

export class WorkerService {
  constructor(
    private readonly workers: IWorkerRepository = workerRepository,
    private readonly skills: ISkillRepository = skillRepository,
  ) {}

  async createProfile(userId: string, data: CreateWorkerDTO): Promise<WorkerProfile> {
    const existing = await this.workers.findByUserId(userId);
    if (existing) throw new ConflictError('Worker profile already exists');
    return this.workers.create(userId, data);
  }

  async updateProfile(userId: string, data: UpdateWorkerDTO): Promise<WorkerProfile> {
    const existing = await this.workers.findByUserId(userId);
    if (!existing) throw new NotFoundError('Worker profile not found');
    return this.workers.update(userId, data);
  }

  async getById(id: string): Promise<WorkerWithUserSkills> {
    const worker = await this.workers.findById(id);
    if (!worker) throw new NotFoundError('Worker not found');
    return worker;
  }

  async getByUserId(userId: string): Promise<WorkerWithUserSkills> {
    const profile = await this.workers.findByUserId(userId);
    if (!profile) throw new NotFoundError('Worker profile not found');
    const full = await this.workers.findById(profile.id);
    if (!full) throw new NotFoundError('Worker profile not found');
    return full;
  }

  async search(
    filters: WorkerFilters,
    query: Record<string, unknown>,
  ): Promise<PaginatedResult<WorkerWithUserSkills>> {
    const pagination = parsePagination(query);
    const { data, total } = await this.workers.search(filters, pagination);
    return buildPaginatedResult(data, total, pagination);
  }

  async addSkill(userId: string, data: AddSkillDTO, fileBuffer?: Buffer): Promise<Skill> {
    const profile = await this.workers.findByUserId(userId);
    if (!profile) throw new NotFoundError('Worker profile not found');

    let certificateUrl: string | undefined;
    if (fileBuffer) {
      const uploaded = await uploadBufferToCloudinary(fileBuffer, 'skillbridge/certificates');
      certificateUrl = uploaded.url;
    }
    return this.skills.add(profile.id, {
      skillName: data.skillName,
      yearsExp: data.yearsExp,
      certificateUrl: certificateUrl ?? data.certificateUrl,
    });
  }

  async removeSkill(userId: string, skillId: string): Promise<void> {
    const profile = await this.workers.findByUserId(userId);
    if (!profile) throw new NotFoundError('Worker profile not found');
    const skill = await this.skills.findById(skillId);
    if (!skill) throw new NotFoundError('Skill not found');
    if (skill.workerProfileId !== profile.id) throw new ForbiddenError('Cannot remove skill of another worker');
    await this.skills.remove(skillId, profile.id);
  }

  async uploadPhoto(userId: string, fileBuffer: Buffer): Promise<WorkerProfile> {
    const profile = await this.workers.findByUserId(userId);
    if (!profile) throw new NotFoundError('Worker profile not found');
    const { url } = await uploadBufferToCloudinary(fileBuffer, 'skillbridge/photos');
    return this.workers.setPhotoUrl(userId, url);
  }
}

export const workerService = new WorkerService();
