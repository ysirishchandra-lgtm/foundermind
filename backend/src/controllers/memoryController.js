/**
 * Memory Controller – Milestone 5
 *
 * Exposes founder memory operations via the REST API.
 * All routes are protected by auth middleware — userId comes from req.user.
 */

const { z } = require('zod');
const hindsightService = require('../services/hindsight.service');

const addMemorySchema = z.object({
  content: z.string().min(1, 'Content cannot be empty').max(4000, 'Content too long'),
});

/**
 * GET /api/memory
 * Returns the founder's stored memories from Hindsight.
 */
const listMemories = async (req, res, next) => {
  try {
    const userId  = req.user.id;
    const start   = Date.now();
    const memories = await hindsightService.listMemories(userId);

    console.log(`[MemoryCtrl] list userId=${userId} count=${memories.length} latency=${Date.now() - start}ms`);

    res.status(200).json({
      success: true,
      data: memories,
      count: memories.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/memory
 * Manually add a fact to the founder's memory bank.
 * Body: { content: string }
 */
const addMemory = async (req, res, next) => {
  try {
    const { content } = addMemorySchema.parse(req.body);
    const userId = req.user.id;

    const success = await hindsightService.addMemory(userId, content);

    if (!success) {
      return res.status(502).json({ success: false, error: 'Failed to store memory. Check Hindsight connection.' });
    }

    console.log(`[MemoryCtrl] add userId=${userId} content="${content.slice(0, 60)}..."`);

    res.status(201).json({
      success: true,
      message: 'Memory stored successfully. Hindsight is extracting facts.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/memory/reflect
 * Use Hindsight reflect to synthesise insights from the founder's memory bank.
 * Query: ?q=<topic>
 */
const reflectMemory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const query  = req.query.q || 'What are the most important things to know about this founder?';

    const insight = await hindsightService.reflectMemory(userId, query);

    res.status(200).json({
      success: true,
      data: { insight, query },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listMemories, addMemory, reflectMemory };
