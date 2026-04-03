import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { db, initDatabase } from '../config/database';
import { generateId, now } from '../utils/helpers';

const clearData = () => {
  db.exec('DELETE FROM financial_records');
  db.exec('DELETE FROM users');
  console.log('Cleared existing data');
};

const createUsers = () => {
  const users = [
    {
      id: generateId(),
      name: 'Admin User',
      email: 'admin@example.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      status: 'active'
    },
    {
      id: generateId(),
      name: 'Analyst User',
      email: 'analyst@example.com',
      password: bcrypt.hashSync('analyst123', 10),
      role: 'analyst',
      status: 'active'
    },
    {
      id: generateId(),
      name: 'Viewer User',
      email: 'viewer@example.com',
      password: bcrypt.hashSync('viewer123', 10),
      role: 'viewer',
      status: 'active'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, password, role, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  users.forEach(user => {
    const timestamp = now();
    stmt.run(user.id, user.name, user.email, user.password, user.role, user.status, timestamp, timestamp);
  });

  console.log('Created 3 users');
  return users;
};

const createRecords = (users: any[]) => {
  const adminId = users[0].id;
  const analystId = users[1].id;

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Bonus'],
    expense: ['Rent', 'Groceries', 'Utilities', 'Transport', 'Healthcare', 'Entertainment', 'Shopping']
  };

  const records = [];
  const today = new Date();

  // Generate records for the last 4 months
  for (let monthOffset = 0; monthOffset < 4; monthOffset++) {
    const month = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);

    // Income records (2-3 per month)
    for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
      const day = Math.floor(Math.random() * 28) + 1;
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const category = categories.income[Math.floor(Math.random() * categories.income.length)];
      const amount = category === 'Salary' ? 5000 + Math.random() * 2000 : 500 + Math.random() * 1500;

      records.push({
        id: generateId(),
        user_id: i % 2 === 0 ? adminId : analystId,
        amount: Math.round(amount * 100) / 100,
        type: 'income',
        category,
        date: date.toISOString().split('T')[0],
        notes: `${category} for ${month.toLocaleString('default', { month: 'long' })}`,
        deleted_at: null
      });
    }

    // Expense records (3-5 per month)
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
      const day = Math.floor(Math.random() * 28) + 1;
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const category = categories.expense[Math.floor(Math.random() * categories.expense.length)];
      let amount;

      switch (category) {
        case 'Rent':
          amount = 1200 + Math.random() * 300;
          break;
        case 'Groceries':
          amount = 100 + Math.random() * 200;
          break;
        case 'Utilities':
          amount = 80 + Math.random() * 120;
          break;
        default:
          amount = 30 + Math.random() * 170;
      }

      records.push({
        id: generateId(),
        user_id: i % 2 === 0 ? adminId : analystId,
        amount: Math.round(amount * 100) / 100,
        type: 'expense',
        category,
        date: date.toISOString().split('T')[0],
        notes: null,
        deleted_at: null
      });
    }
  }

  const stmt = db.prepare(`
    INSERT INTO financial_records (id, user_id, amount, type, category, date, notes, deleted_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  records.forEach(record => {
    const timestamp = now();
    stmt.run(
      record.id,
      record.user_id,
      record.amount,
      record.type,
      record.category,
      record.date,
      record.notes,
      record.deleted_at,
      timestamp,
      timestamp
    );
  });

  console.log(`Created ${records.length} financial records`);
};

const seed = () => {
  try {
    initDatabase();
    clearData();
    const users = createUsers();
    createRecords(users);

    console.log('\n=== Seed completed successfully ===');
    console.log('\nTest Credentials:');
    console.log('Admin:   admin@example.com / admin123');
    console.log('Analyst: analyst@example.com / analyst123');
    console.log('Viewer:  viewer@example.com / viewer123');
    console.log('\nYou can now run: npm run dev');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
