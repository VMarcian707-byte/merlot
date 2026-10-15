import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import cardRoutes from './routes/cards';
import discountRoutes from './routes/discounts';
import visitRoutes from './routes/visits';
import announcementRoutes from './routes/announcements';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📨 ${req.method} ${req.path}`);
  }
  next();
});

// Initialize database
initDatabase().then(() => {
  console.log('✅ Database ready');
}).catch((error) => {
  console.error('❌ Failed to initialize database:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🍷  MERLOT VIP - Custom Backend                         ║
  ║                                                           ║
  ║   🚀  Server running on http://localhost:${PORT}            ║
  ║   📊  Environment: ${process.env.NODE_ENV || 'development'}                          ║
  ║   🔌  API: http://localhost:${PORT}/api                     ║
  ║                                                           ║
  ║   📋  Available endpoints:                                ║
  ║     • POST   /api/auth/register                           ║
  ║     • POST   /api/auth/login                              ║
  ║     • POST   /api/auth/reset-password                     ║
  ║     • GET    /api/users                                   ║
  ║     • GET    /api/cards                                   ║
  ║     • POST   /api/cards/scan                              ║
  ║     • GET    /api/discounts                               ║
  ║     • GET    /api/visits                                  ║
  ║     • GET    /api/announcements                           ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
