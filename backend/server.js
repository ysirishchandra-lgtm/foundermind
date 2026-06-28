require('dotenv').config();

// Validate vital environment variables at startup
const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'OPENAI_API_KEY',
  'HINDSIGHT_API_KEY'
];
const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.warn(`\x1b[33m[WARNING] Missing vital environment variables: ${missingVars.join(', ')}\x1b[0m`);
  console.warn('FounderMind may fail to route requests, authenticate users, or connect to the database.');
} else {
  console.log('[DIAGNOSTICS] All required environment variables are present.');
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./src/middleware/errorMiddleware');
const authRoutes = require('./src/routes/authRoutes');

const conversationRoutes = require('./src/routes/conversationRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const memoryRoutes = require('./src/routes/memoryRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const { authRateLimiter, chatRateLimiter } = require('./src/middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS – allow Vercel production + localhost dev origins with credentials
const ALLOWED_ORIGINS = [
  'https://foundermind.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile, server-side)
    if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true); // permissive for tunnel/preview URLs
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'bypass-tunnel-reminder'],
}));
// rely on express.json() for JSON parsing


// Request logger middleware – logs route, method, user ID, execution time, and errors
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const userId = req.user?.id || 'anonymous';
  console.log(`[REQ] ${req.method} ${req.originalUrl} (user=${userId})`);
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[RESP] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
};

// Insert middleware chain
app.use(requestLogger);
app.use(express.json());
app.use(morgan('dev'));

// Routes (with targeted rate limiting on sensitive endpoints)
app.use('/api/auth',          authRateLimiter, authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/chat',          chatRateLimiter, chatRoutes);
app.use('/api/memory',        memoryRoutes);
app.use('/api/analytics',     analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FounderMind Backend API is running' });
});

// Centralized error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
