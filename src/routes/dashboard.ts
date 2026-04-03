import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/authorize';
import { AuthRequest } from '../types';
import { getSummary, getWeeklyData } from '../services/dashboardService';
import { dashboardQuerySchema } from '../utils/validators';

const router = Router();

router.get('/summary', authenticate, requireRole('analyst'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = dashboardQuerySchema.parse(req.query);
    const summary = getSummary(query);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

router.get('/weekly', authenticate, requireRole('analyst'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = getWeeklyData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
