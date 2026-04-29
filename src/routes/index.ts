import { Router } from 'express';
import authRoutes from './authRoutes';
import workerRoutes from './workerRoutes';
import jobRoutes from './jobRoutes';
import applicationRoutes from './applicationRoutes';
import reviewRoutes from './reviewRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/workers', workerRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);

export default router;
