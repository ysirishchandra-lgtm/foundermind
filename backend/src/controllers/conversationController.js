const { z } = require('zod');
const conversationService = require('../services/conversationService');

const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255)
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  status: z.enum(['active', 'archived']).optional()
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

const listConversations = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await conversationService.listConversations(req.user.id, { page, limit });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getConversation = async (req, res, next) => {
  try {
    const conversation = await conversationService.getConversation(req.params.id, req.user.id);
    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });
    res.json({ success: true, data: conversation });
  } catch (err) { next(err); }
};

const createConversation = async (req, res, next) => {
  try {
    const { title } = createSchema.parse(req.body);
    const conversation = await conversationService.createConversation(req.user.id, title);
    res.status(201).json({ success: true, data: conversation });
  } catch (err) { next(err); }
};

const updateConversation = async (req, res, next) => {
  try {
    const fields = updateSchema.parse(req.body);
    const conversation = await conversationService.updateConversation(req.params.id, req.user.id, fields);
    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });
    res.json({ success: true, data: conversation });
  } catch (err) { next(err); }
};

const deleteConversation = async (req, res, next) => {
  try {
    const existing = await conversationService.getConversation(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Conversation not found' });
    await conversationService.deleteConversation(req.params.id, req.user.id);
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err) { next(err); }
};

module.exports = { listConversations, getConversation, createConversation, updateConversation, deleteConversation };
