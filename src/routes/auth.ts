import { Router, Request, Response, NextFunction } from 'express';
import { login } from '../services/authService';
import { loginSchema } from '../utils/validators';

const router = Router();

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = login(data.email, data.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
