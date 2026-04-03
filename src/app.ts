import express from 'express';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import recordRoutes from './routes/records';
import dashboardRoutes from './routes/dashboard';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' }
});

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later' }
});

app.use(generalLimiter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Finance Data Processing and Access Control Backend',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: 'POST /api/auth/login',
      users: 'GET /api/users (Admin only)',
      records: 'GET /api/records (Viewer+)',
      dashboard: 'GET /api/dashboard/summary (Analyst+)'
    },
    documentation: 'See README.md for full API documentation',
    testCredentials: {
      admin: 'admin@example.com / admin123',
      analyst: 'analyst@example.com / analyst123',
      viewer: 'viewer@example.com / viewer123'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
