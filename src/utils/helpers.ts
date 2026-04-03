import { randomUUID } from 'crypto';
import { User, UserWithoutPassword } from '../types';

export const generateId = (): string => {
  return randomUUID();
};

export const now = (): string => {
  return new Date().toISOString();
};

export const omitPassword = (user: User): UserWithoutPassword => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const parsePagination = (query: any): { page: number; limit: number } => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 20;
  
  page = Math.max(1, page);
  limit = Math.max(1, Math.min(100, limit));
  
  return { page, limit };
};

export const getRoleRank = (role: string): number => {
  const ranks: Record<string, number> = {
    viewer: 1,
    analyst: 2,
    admin: 3
  };
  return ranks[role] || 0;
};
