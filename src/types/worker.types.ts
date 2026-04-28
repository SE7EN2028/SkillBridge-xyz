export interface CreateWorkerDTO {
    city: string;
    bio?: string;
    hourlyRate: number;
  }
  
  export interface UpdateWorkerDTO {
    city?: string;
    bio?: string;
    hourlyRate?: number;
    isAvailable?: boolean;
  }
  
  export interface AddSkillDTO {
    skillName: string;
    yearsExp: number;
    certificateUrl?: string;
  }
  
  export interface WorkerFilters {
    skill?: string;
    city?: string;
    minRating?: number;
    maxRate?: number;
    isVerified?: boolean;
    isAvailable?: boolean;
  }