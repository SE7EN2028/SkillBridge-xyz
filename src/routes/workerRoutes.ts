import { Router } from 'express';
import * as workerController from '../controllers/workerController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { upload } from '../middleware/upload';
import {
  createWorkerProfileSchema,
  updateWorkerProfileSchema,
  addSkillSchema,
} from '../validators/worker.validator';

const router = Router();

router.get('/', workerController.search);
router.get('/me', authenticate, authorize('WORKER'), workerController.getMe);
router.get('/:id', workerController.getById);

router.post(
  '/',
  authenticate,
  authorize('WORKER'),
  validate(createWorkerProfileSchema),
  workerController.createProfile,
);

router.patch(
  '/me',
  authenticate,
  authorize('WORKER'),
  validate(updateWorkerProfileSchema),
  workerController.updateProfile,
);

router.post(
  '/me/skills',
  authenticate,
  authorize('WORKER'),
  upload.single('certificate'),
  validate(addSkillSchema),
  workerController.addSkill,
);

router.delete(
  '/me/skills/:skillId',
  authenticate,
  authorize('WORKER'),
  workerController.removeSkill,
);

router.post(
  '/me/photo',
  authenticate,
  authorize('WORKER'),
  upload.single('photo'),
  workerController.uploadPhoto,
);

export default router;
