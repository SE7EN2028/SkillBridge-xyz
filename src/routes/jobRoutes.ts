import { Router } from 'express';
import * as jobController from '../controllers/jobController';
import * as applicationController from '../controllers/applicationController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  createJobSchema,
  applyToJobSchema,
} from '../validators/job.validator';

const router = Router();

router.get('/', jobController.search);
router.get('/:id', jobController.getById);

router.post(
  '/',
  authenticate,
  authorize('EMPLOYER'),
  validate(createJobSchema),
  jobController.create,
);

router.patch('/:id/status', authenticate, authorize('EMPLOYER'), jobController.setStatus);
router.delete('/:id', authenticate, authorize('EMPLOYER'), jobController.remove);

router.post(
  '/:jobId/applications',
  authenticate,
  authorize('WORKER'),
  validate(applyToJobSchema),
  applicationController.apply,
);

router.get(
  '/:jobId/applications',
  authenticate,
  authorize('EMPLOYER'),
  applicationController.listForJob,
);

export default router;
