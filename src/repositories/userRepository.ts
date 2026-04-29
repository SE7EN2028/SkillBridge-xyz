import type { PrismaClient, User, Role } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: Partial<Pick<User, 'name' | 'isActive'>>): Promise<User>;
  delete(id: string): Promise<void>;
  setActive(id: string, isActive: boolean): Promise<User>;
}

export class UserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  create(data: CreateUserInput): Promise<User> {
    return this.db.user.create({
      data: { ...data, email: data.email.toLowerCase() },
    });
  }

  update(id: string, data: Partial<Pick<User, 'name' | 'isActive'>>): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }

  setActive(id: string, isActive: boolean): Promise<User> {
    return this.db.user.update({ where: { id }, data: { isActive } });
  }
}

export const userRepository = new UserRepository();
