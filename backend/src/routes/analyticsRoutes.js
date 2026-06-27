const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { getDashboardData } = require('../controllers/analyticsController');

const router = express.Router();

// Require JWT authorization for all analytics
router.get('/dashboard', requireAuth, getDashboardData);

module.exports = router;
