import { Role } from '@prisma/client';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}