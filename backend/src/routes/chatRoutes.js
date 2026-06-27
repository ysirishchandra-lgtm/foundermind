const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { chat } = require('../controllers/chatController');

const router = express.Router();

router.use(requireAuth);

/**
 * POST /api/chat
 * Body: { conversationId: string, message: string }
 */
router.post('/', chat);

module.exports = router;
