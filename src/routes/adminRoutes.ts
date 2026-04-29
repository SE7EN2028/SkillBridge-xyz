import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/workers/unverified', adminController.listUnverifiedWorkers);
router.patch('/workers/:workerId/verify', adminController.verifyWorker);
router.patch('/users/:userId/active', adminController.setUserActive);
router.get('/stats', adminController.stats);

export default router;
