import { apiRequest, apiPaginated } from './api';
import type {
  ApplicationStatus,
  AuthResponse,
  Job,
  JobStatus,
  Paginated,
  Review,
  Skill,
  WorkerProfile,
  Application,
  Role,
} from '@/types/api';

export const authApi = {
  register: (body: { name: string; email: string; password: string; role: Exclude<Role, 'ADMIN'> }) =>
    apiRequest<AuthResponse>('/auth/register', { method: 'POST', body, auth: false }),
  login: (body: { email: string; password: string }) =>
    apiRequest<AuthResponse>('/auth/login', { method: 'POST', body, auth: false }),
  logout: (refreshToken: string) =>
    apiRequest<void>('/auth/logout', { method: 'POST', body: { refreshToken }, auth: false }),
};

export const workerApi = {
  search: (params: Record<string, string | number | undefined>): Promise<Paginated<WorkerProfile>> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    const q = qs.toString();
    return apiPaginated<WorkerProfile>(`/workers${q ? `?${q}` : ''}`, { auth: false });
  },
  get: (id: string) => apiRequest<WorkerProfile>(`/workers/${id}`, { auth: false }),
  me: () => apiRequest<WorkerProfile>('/workers/me'),
  create: (body: { city: string; bio?: string; hourlyRate: number }) =>
    apiRequest<WorkerProfile>('/workers', { method: 'POST', body }),
  update: (body: { city?: string; bio?: string; hourlyRate?: number; isAvailable?: boolean }) =>
    apiRequest<WorkerProfile>('/workers/me', { method: 'PATCH', body }),
  addSkill: (body: { skillName: string; yearsExp: number }) =>
    apiRequest<Skill>('/workers/me/skills', { method: 'POST', body }),
  removeSkill: (skillId: string) =>
    apiRequest<void>(`/workers/me/skills/${skillId}`, { method: 'DELETE' }),
};

export const jobApi = {
  search: (params: Record<string, string | number | undefined>): Promise<Paginated<Job>> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    const q = qs.toString();
    return apiPaginated<Job>(`/jobs${q ? `?${q}` : ''}`, { auth: false });
  },
  get: (id: string) => apiRequest<Job>(`/jobs/${id}`, { auth: false }),
  create: (body: { title: string; description?: string; skillRequired: string; city: string; budget: number }) =>
    apiRequest<Job>('/jobs', { method: 'POST', body }),
  setStatus: (id: string, status: JobStatus) =>
    apiRequest<Job>(`/jobs/${id}/status`, { method: 'PATCH', body: { status } }),
  remove: (id: string) => apiRequest<void>(`/jobs/${id}`, { method: 'DELETE' }),
  apply: (jobId: string, coverNote?: string) =>
    apiRequest<Application>(`/jobs/${jobId}/applications`, {
      method: 'POST',
      body: { coverNote },
    }),
  applications: (jobId: string) =>
    apiRequest<Application[]>(`/jobs/${jobId}/applications`),
};

export const applicationApi = {
  mine: () => apiRequest<Application[]>('/applications/me'),
  setStatus: (id: string, status: ApplicationStatus) =>
    apiRequest<Application>(`/applications/${id}/status`, { method: 'PATCH', body: { status } }),
  cancel: (id: string) =>
    apiRequest<Application>(`/applications/${id}/cancel`, { method: 'POST' }),
};

export const reviewApi = {
  create: (body: { applicationId: string; rating: number; comment?: string }) =>
    apiRequest<Review>('/reviews', { method: 'POST', body }),
  byWorker: (workerId: string) =>
    apiRequest<Review[]>(`/reviews/worker/${workerId}`, { auth: false }),
};

export const adminApi = {
  unverifiedWorkers: () => apiRequest<WorkerProfile[]>('/admin/workers/unverified'),
  verifyWorker: (workerId: string, verified: boolean) =>
    apiRequest<WorkerProfile>(`/admin/workers/${workerId}/verify`, { method: 'PATCH', body: { verified } }),
  setUserActive: (userId: string, isActive: boolean) =>
    apiRequest<void>(`/admin/users/${userId}/active`, { method: 'PATCH', body: { isActive } }),
  stats: () =>
    apiRequest<{
      totalUsers: number;
      totalWorkers: number;
      totalEmployers: number;
      totalJobs: number;
      totalApplications: number;
      totalCompletedJobs: number;
    }>('/admin/stats'),
};
