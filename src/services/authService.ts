import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { db } from '../config/database';
import { User, AppError, UserWithoutPassword } from '../types';
import { omitPassword } from '../utils/helpers';

export const login = (email: string, password: string): { token: string; user: UserWithoutPassword } => {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new AppError(401, 'Invalid credentials');
  }

  if (user.status !== 'active') {
    throw new AppError(403, 'Account is inactive');
  }

  const secret = process.env.JWT_SECRET || 'default_secret';

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: omitPassword(user)
  };
};
