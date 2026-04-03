import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/authorize';
import { AuthRequest } from '../types';
import { getRecords, getRecordById, createRecord, updateRecord, deleteRecord } from '../services/recordService';
import { createRecordSchema, updateRecordSchema, recordFilterSchema } from '../utils/validators';

const router = Router();

router.get('/', authenticate, requireRole('viewer'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filters = recordFilterSchema.parse(req.query);
    const result = getRecords(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, requireRole('viewer'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const record = getRecordById(req.params.id);
    res.json(record);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireRole('analyst'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createRecordSchema.parse(req.body);
    const record = createRecord(req.user!.id, data);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticate, requireRole('analyst'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateRecordSchema.parse(req.body);
    const record = updateRecord(req.params.id, data);
    res.json(record);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    deleteRecord(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
