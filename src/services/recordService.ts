import { db } from '../config/database';
import { FinancialRecord, AppError, PaginatedResponse } from '../types';
import { generateId, now } from '../utils/helpers';

interface RecordFilters {
  type?: string;
  category?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

export const getRecords = (filters: RecordFilters): PaginatedResponse<FinancialRecord> => {
  const conditions: string[] = ['deleted_at IS NULL'];
  const params: any[] = [];

  if (filters.type) {
    conditions.push('type = ?');
    params.push(filters.type);
  }

  if (filters.category) {
    conditions.push('category LIKE ?');
    params.push(`%${filters.category}%`);
  }

  if (filters.from) {
    conditions.push('date >= ?');
    params.push(filters.from);
  }

  if (filters.to) {
    conditions.push('date <= ?');
    params.push(filters.to);
  }

  const whereClause = conditions.join(' AND ');

  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM financial_records WHERE ${whereClause}`);
  const { count } = countStmt.get(...params) as { count: number };

  const offset = (filters.page - 1) * filters.limit;
  const dataStmt = db.prepare(`
    SELECT * FROM financial_records 
    WHERE ${whereClause}
    ORDER BY date DESC, created_at DESC
    LIMIT ? OFFSET ?
  `);

  const data = dataStmt.all(...params, filters.limit, offset) as FinancialRecord[];

  return {
    data,
    total: count,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(count / filters.limit)
  };
};

export const getRecordById = (id: string): FinancialRecord => {
  const record = db.prepare('SELECT * FROM financial_records WHERE id = ? AND deleted_at IS NULL')
    .get(id) as FinancialRecord | undefined;
  
  if (!record) {
    throw new AppError(404, 'Record not found');
  }
  
  return record;
};

export const createRecord = (userId: string, data: {
  amount: number;
  type: string;
  category: string;
  date: string;
  notes?: string;
}): FinancialRecord => {
  const id = generateId();
  const timestamp = now();

  const stmt = db.prepare(`
    INSERT INTO financial_records (id, user_id, amount, type, category, date, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    userId,
    data.amount,
    data.type,
    data.category,
    data.date,
    data.notes || null,
    timestamp,
    timestamp
  );

  return getRecordById(id);
};

export const updateRecord = (id: string, data: {
  amount?: number;
  type?: string;
  category?: string;
  date?: string;
  notes?: string;
}): FinancialRecord => {
  const record = getRecordById(id);

  const updates: string[] = [];
  const values: any[] = [];

  if (data.amount !== undefined) {
    updates.push('amount = ?');
    values.push(data.amount);
  }

  if (data.type) {
    updates.push('type = ?');
    values.push(data.type);
  }

  if (data.category) {
    updates.push('category = ?');
    values.push(data.category);
  }

  if (data.date) {
    updates.push('date = ?');
    values.push(data.date);
  }

  if (data.notes !== undefined) {
    updates.push('notes = ?');
    values.push(data.notes || null);
  }

  if (updates.length === 0) {
    return record;
  }

  updates.push('updated_at = ?');
  values.push(now());
  values.push(id);

  const stmt = db.prepare(`UPDATE financial_records SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);

  return getRecordById(id);
};

export const deleteRecord = (id: string): void => {
  const record = getRecordById(id);

  const stmt = db.prepare('UPDATE financial_records SET deleted_at = ? WHERE id = ?');
  stmt.run(now(), id);
};
