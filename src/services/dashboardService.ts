import { db } from '../config/database';
import { DashboardSummary, WeeklyData, FinancialRecord } from '../types';

interface DateRange {
  from?: string;
  to?: string;
}

export const getSummary = (dateRange: DateRange): DashboardSummary => {
  const conditions: string[] = ['deleted_at IS NULL'];
  const params: any[] = [];

  if (dateRange.from) {
    conditions.push('date >= ?');
    params.push(dateRange.from);
  }

  if (dateRange.to) {
    conditions.push('date <= ?');
    params.push(dateRange.to);
  }

  const whereClause = conditions.join(' AND ');

  // Total income and expenses
  const totalsStmt = db.prepare(`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpenses,
      COUNT(*) as recordCount
    FROM financial_records
    WHERE ${whereClause}
  `);
  const totals = totalsStmt.get(...params) as any;

  const totalIncome = totals.totalIncome || 0;
  const totalExpenses = totals.totalExpenses || 0;
  const netBalance = totalIncome - totalExpenses;
  const recordCount = totals.recordCount || 0;

  // Category totals
  const categoryStmt = db.prepare(`
    SELECT type, category, SUM(amount) as total, COUNT(*) as count
    FROM financial_records
    WHERE ${whereClause}
    GROUP BY type, category
    ORDER BY total DESC
  `);
  const categoryData = categoryStmt.all(...params) as any[];

  const categoryTotals = {
    income: categoryData.filter(c => c.type === 'income').map(c => ({
      category: c.category,
      total: c.total,
      count: c.count
    })),
    expense: categoryData.filter(c => c.type === 'expense').map(c => ({
      category: c.category,
      total: c.total,
      count: c.count
    }))
  };

  // Monthly trends
  const monthlyStmt = db.prepare(`
    SELECT 
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM financial_records
    WHERE ${whereClause}
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `);
  const monthlyData = monthlyStmt.all(...params) as any[];

  const monthlyTrends = monthlyData.map(m => ({
    month: m.month,
    income: m.income || 0,
    expense: m.expense || 0,
    net: (m.income || 0) - (m.expense || 0)
  }));

  // Recent activity
  const recentStmt = db.prepare(`
    SELECT * FROM financial_records
    WHERE ${whereClause}
    ORDER BY date DESC, created_at DESC
    LIMIT 10
  `);
  const recentActivity = recentStmt.all(...params) as FinancialRecord[];

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    recordCount,
    categoryTotals,
    monthlyTrends,
    recentActivity
  };
};

export const getWeeklyData = (): WeeklyData[] => {
  const stmt = db.prepare(`
    SELECT 
      strftime('%Y-W%W', date) as week,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM financial_records
    WHERE deleted_at IS NULL
    GROUP BY week
    ORDER BY week DESC
    LIMIT 12
  `);

  const data = stmt.all() as any[];

  return data.map(w => ({
    week: w.week,
    income: w.income || 0,
    expense: w.expense || 0,
    net: (w.income || 0) - (w.expense || 0)
  }));
};
