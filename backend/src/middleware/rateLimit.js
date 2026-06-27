/**
 * Rate Limit Middleware – FounderMind Production Security
 *
 * Configures separate limiters for:
 *   - Auth endpoints (register/login): 5 req/min per IP (default)
 *   - Chat endpoint: 60 req/min per authenticated user IP (default)
 *
 * Environment variables allow overriding limits for development or staging:
 *   RATE_LIMIT_AUTH_MAX       (default: 5)
 *   RATE_LIMIT_AUTH_WINDOW_MS (default: 60000 = 1 minute)
 *   RATE_LIMIT_CHAT_MAX       (default: 60)
 *   RATE_LIMIT_CHAT_WINDOW_MS (default: 60000 = 1 minute)
 *
 * In NODE_ENV=development, limits are multiplied by 10 so local testing
 * is never accidentally blocked.
 */

const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

// ── Helper: build a human-readable time string ────────────────────────────
function humanWindow(ms) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

// ── Helper: custom handler that logs exceeded requests ─────────────────────
function makeHandler(limiterName) {
  return (req, res, _next, options) => {
    const identifier = req.ip || 'unknown';
    const userId = req.user?.id ? ` (userId=${req.user.id})` : '';
    console.warn(
      `[RateLimit] ⛔ ${limiterName} limit exceeded — IP=${identifier}${userId} path=${req.path} limit=${options.max}/${humanWindow(options.windowMs)}`
    );
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: options.message,
      retryAfter: Math.ceil(options.windowMs / 1000),
    });
  };
}

// ── Auth Rate Limiter ──────────────────────────────────────────────────────
// Protects: POST /api/auth/login, POST /api/auth/register
const AUTH_MAX    = parseInt(process.env.RATE_LIMIT_AUTH_MAX    || '5',     10);
const AUTH_WINDOW = parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '60000', 10);

const authRateLimiter = rateLimit({
  windowMs: AUTH_WINDOW,
  max: isDev ? AUTH_MAX * 10 : AUTH_MAX,
  standardHeaders: true,  // Return RateLimit-* headers
  legacyHeaders: false,
  message: `Too many authentication attempts. Please wait ${humanWindow(AUTH_WINDOW)} before trying again.`,
  handler: makeHandler('Auth'),
  keyGenerator: (req) => req.ip,
  skip: () => false,
});

// ── Chat Rate Limiter ──────────────────────────────────────────────────────
// Protects: POST /api/chat
// Uses authenticated user ID if available (falls back to IP for extra safety)
const CHAT_MAX    = parseInt(process.env.RATE_LIMIT_CHAT_MAX    || '60',    10);
const CHAT_WINDOW = parseInt(process.env.RATE_LIMIT_CHAT_WINDOW_MS || '60000', 10);

const chatRateLimiter = rateLimit({
  windowMs: CHAT_WINDOW,
  max: isDev ? CHAT_MAX * 10 : CHAT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: `You have sent too many messages. Please wait ${humanWindow(CHAT_WINDOW)} before continuing.`,
  handler: makeHandler('Chat'),
  // Use authenticated userId when available, fall back to IP
  keyGenerator: (req) => req.user?.id || req.ip,
  skip: () => false,
});

// ── Startup diagnostic log ─────────────────────────────────────────────────
const effectiveAuthMax = isDev ? AUTH_MAX * 10 : AUTH_MAX;
const effectiveChatMax = isDev ? CHAT_MAX * 10 : CHAT_MAX;
console.log(
  `[RateLimit] Auth limiter: ${effectiveAuthMax} req/${humanWindow(AUTH_WINDOW)}` +
  ` | Chat limiter: ${effectiveChatMax} req/${humanWindow(CHAT_WINDOW)}` +
  ` | mode=${isDev ? 'development (relaxed)' : 'production'}`
);

module.exports = { authRateLimiter, chatRateLimiter };
