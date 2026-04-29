import type { Review } from '@prisma/client';
import { reviewRepository, type IReviewRepository, type ReviewWithReviewer } from '../repositories/reviewRepository';
import {
  applicationRepository,
  type IApplicationRepository,
} from '../repositories/applicationRepository';
import { workerRepository, type IWorkerRepository } from '../repositories/workerRepository';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../utils/appError';
import type { CreateReviewDTO } from '../types/review.types';

export class ReviewService {
  constructor(
    private readonly reviews: IReviewRepository = reviewRepository,
    private readonly applications: IApplicationRepository = applicationRepository,
    private readonly workers: IWorkerRepository = workerRepository,
  ) {}

  async create(reviewerId: string, data: CreateReviewDTO): Promise<Review> {
    const app = await this.applications.findById(data.applicationId);
    if (!app) throw new NotFoundError('Application not found');
    if (app.job.employerId !== reviewerId) throw new ForbiddenError('Only the employer can review');
    if (app.status !== 'COMPLETED') {
      throw new BadRequestError('Application must be COMPLETED before review');
    }

    const existing = await this.reviews.findByApplication(data.applicationId);
    if (existing) throw new ConflictError('Review already exists for this application');

    const review = await this.reviews.create({
      applicationId: data.applicationId,
      workerProfileId: app.workerProfileId,
      reviewerId,
      rating: data.rating,
      comment: data.comment,
    });

    const agg = await this.reviews.aggregateForWorker(app.workerProfileId);
    const avg = agg._avg.rating ?? 0;
    await this.workers.recomputeRating(app.workerProfileId, avg, agg._count.rating);

    return review;
  }

  listByWorker(workerProfileId: string): Promise<ReviewWithReviewer[]> {
    return this.reviews.listByWorker(workerProfileId);
  }
}

export const reviewService = new ReviewService();
