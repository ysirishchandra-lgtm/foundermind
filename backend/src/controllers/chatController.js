const { z } = require('zod');
const chatService = require('../services/chat.service');
const conversationService = require('../services/conversationService');
const messageService = require('../services/messageService');

const chatSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  message: z.string().min(1, 'Message cannot be empty').max(8000, 'Message too long'),
});

/**
 * POST /api/chat
 *
 * Full AI chat flow:
 *   Auth → Conversation validation → Load history → AI → Persist → Respond
 */
const chat = async (req, res, next) => {
  try {
    const { conversationId, message } = chatSchema.parse(req.body);
    const userId = req.user.id;

    // 1. Verify conversation belongs to the user
    const conversation = await conversationService.getConversation(conversationId, userId);
    if (!conversation) {
      return res.status(403).json({ success: false, error: 'Access denied or conversation not found' });
    }

    // 2. Load recent conversation history (last 5 messages for context window to increase speed)
    const historyResult = await messageService.listMessages(conversationId, userId, { page: 1, limit: 5 });
    const history = historyResult?.data || [];

    // 3. Persist the user message immediately
    const userMessage = await messageService.createMessage(conversationId, userId, {
      role: 'user',
      content: message,
    });

    // 4. Process through chat service (OpenAI, with Hindsight/CascadeFlow stubs)
    const aiResponse = await chatService.processMessage(userId, conversationId, history, message);

    // 5. Persist the assistant response (with token + model metadata)
    const assistantMessage = await messageService.createMessage(conversationId, userId, {
      role: 'assistant',
      content: aiResponse.content,
      token_count: aiResponse.tokens,
      model_used: aiResponse.model,
    });

    // 6. Touch conversation updated_at so it bubbles to top of list
    await conversationService.updateConversation(conversationId, userId, {});

    // 7. Return structured response
    res.status(200).json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
        meta: {
          model: aiResponse.model,
          tokens: {
            prompt: aiResponse.promptTokens,
            completion: aiResponse.completionTokens,
            total: aiResponse.tokens,
          },
          latencyMs: aiResponse.latencyMs,
          finishReason: aiResponse.finishReason,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/chat/stream
 *
 * Streaming version – returns Server-Sent Events (text/event-stream).
 * The frontend reads tokens as they arrive and renders them word-by-word.
 */
const chatStream = async (req, res, next) => {
  try {
    const { conversationId, message } = chatSchema.parse(req.body);
    const userId = req.user.id;

    // 1. Verify conversation belongs to user
    const conversation = await conversationService.getConversation(conversationId, userId);
    if (!conversation) {
      return res.status(403).json({ success: false, error: 'Access denied or conversation not found' });
    }

    // 2. Load history (last 5 messages for speed)
    const historyResult = await messageService.listMessages(conversationId, userId, { page: 1, limit: 5 });
    const history = historyResult?.data || [];

    // 3. Persist user message immediately
    const userMessage = await messageService.createMessage(conversationId, userId, {
      role: 'user',
      content: message,
    });

    // 4. Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 5. Stream tokens
    let fullContent = '';


    try {
      const tokenStream = chatService.streamMessage(userId, conversationId, history, message);

      for await (const token of tokenStream) {
        fullContent += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    } catch (streamErr) {
      res.write(`data: ${JSON.stringify({ error: streamErr.message })}\n\n`);
      res.end();
      return;
    }

    // 6. Persist assistant message
    const assistantMessage = await messageService.createMessage(conversationId, userId, {
      role: 'assistant',
      content: fullContent,
    });

    // 7. Touch conversation
    await conversationService.updateConversation(conversationId, userId, {});

    // 8. Send done event with full message for client to store
    res.write(`data: ${JSON.stringify({ done: true, userMessage, assistantMessage })}\n\n`);
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
};

module.exports = { chat, chatStream };
