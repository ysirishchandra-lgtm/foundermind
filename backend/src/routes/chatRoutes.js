const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { chat, chatStream } = require('../controllers/chatController');

const router = express.Router();

router.use(requireAuth);

/**
 * POST /api/chat
 * Body: { conversationId: string, message: string }
 */
router.post('/', chat);

/**
 * POST /api/chat/stream
 * Body: { conversationId: string, message: string }
 * Returns: text/event-stream SSE
 */
router.post('/stream', chatStream);

module.exports = router;
