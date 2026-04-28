import { User, Role } from '@prisma/client';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: { name: string; email: string; passwordHash: string; role: Role }): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  setActive(id: string, isActive: boolean): Promise<User>;
}