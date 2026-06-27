const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { listConversations, getConversation, createConversation, updateConversation, deleteConversation } = require('../controllers/conversationController');

const router = express.Router();

router.use(requireAuth); // All conversation routes require authentication

router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.patch('/:id', updateConversation);
router.delete('/:id', deleteConversation);

module.exports = router;
