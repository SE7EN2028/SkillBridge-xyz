import type { Prisma, PrismaClient, Review } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';

export type ReviewWithReviewer = Prisma.ReviewGetPayload<{
  include: { reviewer: { select: { id: true; name: true } } };
}>;

export interface IReviewRepository {
  create(data: {
    applicationId: string;
    workerProfileId: string;
    reviewerId: string;
    rating: number;
    comment?: string;
  }): Promise<Review>;
  findByApplication(applicationId: string): Promise<Review | null>;
  listByWorker(workerProfileId: string): Promise<ReviewWithReviewer[]>;
  aggregateForWorker(
    workerProfileId: string,
  ): Promise<{ _avg: { rating: number | null }; _count: { rating: number } }>;
}

export class ReviewRepository implements IReviewRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  create(data: {
    applicationId: string;
    workerProfileId: string;
    reviewerId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    return this.db.review.create({
      data: {
        applicationId: data.applicationId,
        workerProfileId: data.workerProfileId,
        reviewerId: data.reviewerId,
        rating: data.rating,
        comment: data.comment ?? null,
      },
    });
  }

  findByApplication(applicationId: string): Promise<Review | null> {
    return this.db.review.findUnique({ where: { applicationId } });
  }

  listByWorker(workerProfileId: string): Promise<ReviewWithReviewer[]> {
    return this.db.review.findMany({
      where: { workerProfileId },
      include: { reviewer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  aggregateForWorker(
    workerProfileId: string,
  ): Promise<{ _avg: { rating: number | null }; _count: { rating: number } }> {
    return this.db.review.aggregate({
      where: { workerProfileId },
      _avg: { rating: true },
      _count: { rating: true },
    });
  }
}

export const reviewRepository = new ReviewRepository();
