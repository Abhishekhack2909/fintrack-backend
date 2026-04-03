import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    
    return res.status(400).json({
      error: 'Validation failed.',
      details
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  console.error('Unhandled error:', err);

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return res.status(500).json({
    error: 'Internal server error',
    ...(isDevelopment && { detail: err.message })
  });
};
