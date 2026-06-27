const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { listMessages, createMessage, deleteMessage } = require('../controllers/messageController');

const router = express.Router();

router.use(requireAuth);

router.get('/:conversationId', listMessages);
router.post('/:conversationId', createMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
