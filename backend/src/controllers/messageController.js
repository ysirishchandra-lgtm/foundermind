const { z } = require('zod');
const messageService = require('../services/messageService');
const conversationService = require('../services/conversationService');
const chatService = require('../services/chat.service');

const createSchema = z.object({
  content: z.string().min(1, 'Message content is required')
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50)
});

const listMessages = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await messageService.listMessages(req.params.conversationId, req.user.id, { page, limit });
    if (result === null) return res.status(403).json({ success: false, error: 'Access denied' });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const createMessage = async (req, res, next) => {
  try {
    const { content } = createSchema.parse(req.body);
    const conversationId = req.params.conversationId;

    // Verify conversation ownership
    const conversation = await conversationService.getConversation(conversationId, req.user.id);
    if (!conversation) return res.status(403).json({ success: false, error: 'Access denied' });

    // Persist the user message
    const userMessage = await messageService.createMessage(conversationId, req.user.id, {
      role: 'user',
      content
    });

    // Get message history for context
    const history = await messageService.listMessages(conversationId, req.user.id, { limit: 20 });

    // Process through chat service (all AI logic flows through here)
    const aiResponse = await chatService.processMessage(
      req.user.id,
      conversationId,
      history.data || [],
      content
    );

    // Persist the AI response
    const aiMessage = await messageService.createMessage(conversationId, req.user.id, {
      role: 'assistant',
      content: aiResponse.content,
      token_count: aiResponse.tokens,
      model_used: aiResponse.model
    });

    // Update conversation updated_at
    await conversationService.updateConversation(conversationId, req.user.id, {});

    res.status(201).json({ success: true, data: { userMessage, aiMessage } });
  } catch (err) { next(err); }
};

const deleteMessage = async (req, res, next) => {
  try {
    await messageService.deleteMessage(req.params.id, req.user.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) { next(err); }
};

module.exports = { listMessages, createMessage, deleteMessage };
