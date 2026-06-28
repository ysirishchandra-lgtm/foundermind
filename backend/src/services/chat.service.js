/**
 * Chat Service – Milestone 6 (CascadeFlow & Hindsight Active)
 *
 * Orchestrates:
 *   1. Hindsight Recall: Fetch context facts matching user query.
 *   2. CascadeFlow Routing: Choose optimal LLM based on rules.
 *   3. OpenAI Execution: Generate response (with automated fallback retry).
 *   4. Hindsight Retain: Persist details for future conversations.
 *   5. Analytics Logging: Record token counts, estimated costs, and latency.
 */

const openaiService = require('./openai.service');
const hindsightService = require('./hindsight.service');
const cascadeflowService = require('./cascadeflow.service');
const { SYSTEM_PROMPT, buildMemoryPrefix } = require('../prompts/system.prompt');

class ChatService {
  /**
   * Process a user message through the full AI pipeline and return a structured response.
   *
   * @param {string} userId          - Authenticated user's ID
   * @param {string} conversationId  - Active conversation ID
   * @param {Array}  history         - Existing messages in this conversation (from DB)
   * @param {string} userMessage     - The latest user message content
   * @returns {{ content, model, tokens, promptTokens, completionTokens, latencyMs, memoryHits, routing }}
   */
  async processMessage(userId, conversationId, history, userMessage) {
    const startTime = Date.now();

    // ── Step 1: Recall persistent memory context ────────────────────────────
    const memoryContext = await hindsightService.recallMemory(userId, userMessage);
    const memoryPrefix  = buildMemoryPrefix(memoryContext);

    // ── Step 2: Determine model via CascadeFlow routing ─────────────────────
    const routingDecision = cascadeflowService.routeRequest(userMessage, history);
    let selectedModel = routingDecision.model;
    let routingReason = routingDecision.reason;
    let isFallbackUsed = false;

    // ── Step 3: Build the full messages array ────────────────────────────────
    const systemContent = memoryPrefix
      ? SYSTEM_PROMPT + '\n\n' + memoryPrefix
      : SYSTEM_PROMPT;

    const messages = [
      { role: 'system', content: systemContent },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    // ── Step 4: Call OpenAI with Fallback Retry Logic ────────────────────────
    let response;
    try {
      console.log(`[Chat] Routing user=${userId} to model=${selectedModel} (${routingReason})`);
      response = await openaiService.generateResponse(messages, selectedModel);
    } catch (err) {
      console.warn(`[Chat] Primary model ${selectedModel} failed: ${err.message}. Triggering CascadeFlow fallback...`);
      
      const fallbackModel = cascadeflowService.getFallbackModel(selectedModel);
      if (fallbackModel === selectedModel) {
        // Fallback is the same model, propagate error
        throw err;
      }

      isFallbackUsed = true;
      selectedModel = fallbackModel;
      routingReason = `Fallback escalation after primary model failed. Original reason: ${routingReason}`;
      
      console.log(`[Chat] Retrying user=${userId} with fallback model=${selectedModel}`);
      response = await openaiService.generateResponse(messages, selectedModel);
    }

    const latencyMs = Date.now() - startTime;
    console.log(`[Chat] ✓ model=${response.model} tokens=${response.tokens} latency=${latencyMs}ms fallback=${isFallbackUsed}`);

    // ── Step 5: Persist interaction context to Hindsight (async, non-blocking) ──
    const retainContent = this._buildRetainContent(userMessage, response.content);
    hindsightService.retainMemory(userId, retainContent).catch(err =>
      console.error('[Chat] Hindsight retain error (non-fatal):', err.message)
    );

    // ── Step 6: Log CascadeFlow Analytics (async, non-blocking) ────────────────
    const analyticsData = {
      modelUsed: response.model,
      queryText: userMessage,
      routingReason: routingReason,
      promptTokens: response.promptTokens,
      completionTokens: response.completionTokens,
      latencyMs: latencyMs
    };
    cascadeflowService.logAnalytics(userId, conversationId, analyticsData).catch(err =>
      console.error('[Chat] CascadeFlow analytics log error (non-fatal):', err.message)
    );

    return {
      ...response,
      latencyMs,
      memoryHits: memoryContext.length,
      routing: {
        model: response.model,
        reason: routingReason,
        fallbackUsed: isFallbackUsed
      }
    };
  }

  /**
   * Streaming variant of processMessage.
   * Yields token chunks as they arrive, then returns the full metadata.
   * The caller should persist messages AFTER consuming the generator.
   *
   * Usage:
   *   const gen = chatService.streamMessage(userId, convId, history, msg);
   *   for await (const token of gen) { res.write(...) }
   *   const { content, model } = gen.return().value (captured internally)
   */
  async *streamMessage(userId, conversationId, history, userMessage) {
    // Step 1: Recall memory
    const memoryContext = await hindsightService.recallMemory(userId, userMessage);
    const memoryPrefix  = buildMemoryPrefix(memoryContext);

    // Step 2: Route model
    const routingDecision = cascadeflowService.routeRequest(userMessage, history);
    const selectedModel   = routingDecision.model;

    // Step 3: Build messages
    const systemContent = memoryPrefix
      ? SYSTEM_PROMPT + '\n\n' + memoryPrefix
      : SYSTEM_PROMPT;

    const messages = [
      { role: 'system', content: systemContent },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    // Step 4: Stream tokens from AI
    let fullContent = '';
    const startTime = Date.now();
    const tokenStream = openaiService.streamResponse(messages, selectedModel);

    for await (const token of tokenStream) {
      fullContent += token;
      yield token;
    }

    const latencyMs = Date.now() - startTime;

    // Step 5: Background: retain memory & analytics
    const retainContent = this._buildRetainContent(userMessage, fullContent);
    hindsightService.retainMemory(userId, retainContent).catch(err =>
      console.error('[Chat] Hindsight retain error (non-fatal):', err.message)
    );
    cascadeflowService.logAnalytics(userId, conversationId, {
      modelUsed: selectedModel,
      queryText: userMessage,
      routingReason: routingDecision.reason,
      latencyMs,
    }).catch(err =>
      console.error('[Chat] Analytics log error (non-fatal):', err.message)
    );

    // Return metadata so controller can persist the assistant message
    return {
      content: fullContent,
      model: selectedModel,
      tokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      latencyMs,
    };
  }

  /**
   * Build a structured string for Hindsight to extract facts from.
   * @private
   */
  _buildRetainContent(userMessage, aiResponse) {
    return [
      `User (founder) said: ${userMessage}`,
      `AI Chief of Staff responded: ${aiResponse}`,
    ].join('\n');
  }
}

module.exports = new ChatService();
