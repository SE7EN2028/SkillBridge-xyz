import { Router } from 'express';
import * as applicationController from '../controllers/applicationController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { updateApplicationStatusSchema } from '../validators/job.validator';

const router = Router();

router.get('/me', authenticate, authorize('WORKER'), applicationController.listForWorker);

router.patch(
  '/:id/status',
  authenticate,
  authorize('EMPLOYER'),
  validate(updateApplicationStatusSchema),
  applicationController.setStatus,
);

router.post('/:id/cancel', authenticate, authorize('WORKER'), applicationController.cancel);

export default router;
