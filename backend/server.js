require('dotenv').config();

// Validate vital environment variables at startup
const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
];
const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.warn(`[WARNING] Missing vital environment variables: ${missingVars.join(', ')}`);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./src/middleware/errorMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const conversationRoutes = require('./src/routes/conversationRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const memoryRoutes = require('./src/routes/memoryRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const meetingRoutes = require('./src/routes/meetingRoutes');
const { authRateLimiter, chatRateLimiter } = require('./src/middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// ── Security Headers (helmet) ──────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow Vercel preview embeddings
  contentSecurityPolicy: false,     // Managed at CDN layer
}));

// ── CORS ──────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://foundermind.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Allow any Vercel preview deployment for this project
    const isVercelPreview = origin.includes('foundermind') && origin.includes('vercel.app');
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
    const isLocalTunnel = isDev && (origin.includes('loca.lt') || origin.includes('ngrok.io'));

    if (isAllowedOrigin || isVercelPreview || isLocalTunnel) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'bypass-tunnel-reminder'],
}));

// ── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' })); // Prevent oversized payloads
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ── Request Logging ───────────────────────────────────────────────────────
if (isDev) {
  app.use(morgan('dev'));
} else {
  // In production, use minimal Apache-style format (no sensitive body logging)
  app.use(morgan('combined', {
    skip: (req) => req.url === '/api/health', // Don't log health checks
  }));
}

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRateLimiter, authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/chat',          chatRateLimiter, chatRoutes);
app.use('/api/memory',        memoryRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/documents',     documentRoutes);
app.use('/api/meetings',      meetingRoutes);

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FounderMind Backend API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
});

// ── Centralized Error Handling ────────────────────────────────────────────
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Server] FounderMind running on port ${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

module.exports = app;
