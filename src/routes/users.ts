import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/authorize';
import { AuthRequest } from '../types';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../services/userService';
import { createUserSchema, updateUserSchema } from '../utils/validators';

const router = Router();

router.get('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = getUserById(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body);
    const user = createUser(data);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = updateUser(req.params.id, data, req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    deleteUser(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
