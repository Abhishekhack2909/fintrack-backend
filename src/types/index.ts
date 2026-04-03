import { Request } from 'express';

export type UserRole = 'admin' | 'analyst' | 'viewer';
export type UserStatus = 'active' | 'inactive';
export type RecordType = 'income' | 'expense';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

export interface FinancialRecord {
  id: string;
  user_id: string;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  recordCount: number;
  categoryTotals: {
    income: Array<{ category: string; total: number; count: number }>;
    expense: Array<{ category: string; total: number; count: number }>;
  };
  monthlyTrends: Array<{ month: string; income: number; expense: number; net: number }>;
  recentActivity: FinancialRecord[];
}

export interface WeeklyData {
  week: string;
  income: number;
  expense: number;
  net: number;
}
