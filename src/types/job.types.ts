import { JobStatus, ApplicationStatus } from '@prisma/client';

export interface CreateJobDTO {
  title: string;
  description?: string;
  skillRequired: string;
  city: string;
  budget: number;
}

export interface JobFilters {
  skillRequired?: string;
  city?: string;
  status?: JobStatus;
  employerId?: string;
}

export interface CreateApplicationDTO {
  jobId: string;
  workerId: string;
  coverNote?: string;
}

export interface UpdateApplicationStatusDTO {
  status: ApplicationStatus;
}