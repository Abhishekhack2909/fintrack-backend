import { Response, NextFunction } from 'express';
import { AuthRequest, AppError, UserRole } from '../types';
import { getRoleRank } from '../utils/helpers';

export const requireRole = (minRole: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    const userRank = getRoleRank(req.user.role);
    const requiredRank = getRoleRank(minRole);

    if (userRank < requiredRank) {
      return next(new AppError(403, 'Insufficient permissions'));
    }

    next();
  };
};
