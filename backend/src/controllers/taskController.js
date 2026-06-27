const { z } = require('zod');
const taskService = require('../services/taskService');

const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'completed']).default('todo'),
  due_date: z.string().datetime().optional().nullable()
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  due_date: z.string().datetime().optional().nullable()
});

const filterSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

const listTasks = async (req, res, next) => {
  try {
    const { status, priority, page, limit } = filterSchema.parse(req.query);
    const result = await taskService.listTasks(req.user.id, { status, priority, page, limit });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTask(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const fields = createSchema.parse(req.body);
    const task = await taskService.createTask(req.user.id, fields);
    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const fields = updateSchema.parse(req.body);
    const existing = await taskService.getTask(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Task not found' });
    const task = await taskService.updateTask(req.params.id, req.user.id, fields);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const existing = await taskService.getTask(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Task not found' });
    await taskService.deleteTask(req.params.id, req.user.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
