export type Role = 'WORKER' | 'EMPLOYER' | 'ADMIN';

export type JobStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ApplicationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Skill {
  id: string;
  workerProfileId: string;
  skillName: string;
  yearsExp: number;
  certificateUrl: string | null;
  createdAt: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  bio: string | null;
  city: string;
  hourlyRate: number;
  isAvailable: boolean;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
  skills?: Skill[];
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string | null;
  skillRequired: string;
  city: string;
  budget: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  employer?: { id: string; name: string };
}

export interface Application {
  id: string;
  jobId: string;
  workerProfileId: string;
  status: ApplicationStatus;
  coverNote: string | null;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  workerProfile?: WorkerProfile;
}

export interface Review {
  id: string;
  applicationId: string;
  workerProfileId: string;
  reviewerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer?: { id: string; name: string };
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface ApiError {
  status: 'error';
  message: string;
  errors?: Record<string, string>;
}
