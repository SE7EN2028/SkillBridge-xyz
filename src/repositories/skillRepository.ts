import type { PrismaClient, Skill } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';

export interface ISkillRepository {
  add(workerProfileId: string, data: { skillName: string; yearsExp: number; certificateUrl?: string }): Promise<Skill>;
  remove(id: string, workerProfileId: string): Promise<void>;
  listByWorker(workerProfileId: string): Promise<Skill[]>;
  findById(id: string): Promise<Skill | null>;
  setCertificateUrl(id: string, url: string): Promise<Skill>;
}

export class SkillRepository implements ISkillRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  add(
    workerProfileId: string,
    data: { skillName: string; yearsExp: number; certificateUrl?: string },
  ): Promise<Skill> {
    return this.db.skill.create({
      data: {
        workerProfileId,
        skillName: data.skillName,
        yearsExp: data.yearsExp,
        certificateUrl: data.certificateUrl ?? null,
      },
    });
  }

  async remove(id: string, workerProfileId: string): Promise<void> {
    await this.db.skill.deleteMany({ where: { id, workerProfileId } });
  }

  listByWorker(workerProfileId: string): Promise<Skill[]> {
    return this.db.skill.findMany({ where: { workerProfileId } });
  }

  findById(id: string): Promise<Skill | null> {
    return this.db.skill.findUnique({ where: { id } });
  }

  setCertificateUrl(id: string, url: string): Promise<Skill> {
    return this.db.skill.update({ where: { id }, data: { certificateUrl: url } });
  }
}

export const skillRepository = new SkillRepository();
