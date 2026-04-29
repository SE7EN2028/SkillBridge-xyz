import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('EMPLOYER'),
  validate(createReviewSchema),
  reviewController.create,
);

router.get('/worker/:workerId', reviewController.listByWorker);

export default router;
