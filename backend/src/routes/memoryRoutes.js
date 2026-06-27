const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { listMemories, addMemory, reflectMemory } = require('../controllers/memoryController');

const router = express.Router();

// All memory routes require authentication
router.use(requireAuth);

// GET  /api/memory         → list all stored memories
router.get('/', listMemories);

// POST /api/memory         → manually add a memory fact
router.post('/', addMemory);

// GET  /api/memory/reflect → AI synthesis of stored memories
router.get('/reflect', reflectMemory);

module.exports = router;
