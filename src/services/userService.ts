import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { User, AppError, UserWithoutPassword } from '../types';
import { generateId, now, omitPassword } from '../utils/helpers';

export const getAllUsers = (): UserWithoutPassword[] => {
  const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as User[];
  return users.map(omitPassword);
};

export const getUserById = (id: string): UserWithoutPassword => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  
  return omitPassword(user);
};

export const createUser = (data: { name: string; email: string; password: string; role: string }): UserWithoutPassword => {
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
  
  if (existingUser) {
    throw new AppError(409, 'Email already exists');
  }

  const id = generateId();
  const hashedPassword = bcrypt.hashSync(data.password, 10);
  const timestamp = now();

  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, password, role, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
  `);

  stmt.run(id, data.name, data.email, hashedPassword, data.role, timestamp, timestamp);

  return getUserById(id);
};

export const updateUser = (
  id: string,
  data: { name?: string; role?: string; status?: string },
  requesterId: string
): UserWithoutPassword => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (id === requesterId && data.role) {
    throw new AppError(403, 'Cannot change your own role');
  }

  if (id === requesterId && data.status === 'inactive') {
    throw new AppError(403, 'Cannot deactivate your own account');
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name) {
    updates.push('name = ?');
    values.push(data.name);
  }

  if (data.role) {
    updates.push('role = ?');
    values.push(data.role);
  }

  if (data.status) {
    updates.push('status = ?');
    values.push(data.status);
  }

  if (updates.length === 0) {
    return omitPassword(user);
  }

  updates.push('updated_at = ?');
  values.push(now());
  values.push(id);

  const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);

  return getUserById(id);
};

export const deleteUser = (id: string, requesterId: string): void => {
  if (id === requesterId) {
    throw new AppError(403, 'Cannot delete your own account');
  }

  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  
  if (result.changes === 0) {
    throw new AppError(404, 'User not found');
  }
};
