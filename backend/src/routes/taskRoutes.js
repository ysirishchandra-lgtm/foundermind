const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { listTasks, getTask, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.use(requireAuth);

router.get('/', listTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
