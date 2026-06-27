/**
 * Hindsight Service – Milestone 5
 *
 * Full integration with Hindsight Cloud (or self-hosted) persistent memory.
 *
 * Architecture:
 *   - Each founder gets an isolated memory bank: `foundermind-{userId}`
 *   - retain()  → stores conversation context; Hindsight extracts structured facts
 *   - recall()  → semantic search over stored memories; injected into system prompt
 *   - reflect() → synthesise insights from stored memories
 *
 * Configuration (env vars):
 *   HINDSIGHT_BASE_URL  → e.g. https://api.hindsight.vectorize.io (cloud) or http://localhost:8888
 *   HINDSIGHT_API_KEY   → Your Hindsight Cloud API key (leave empty for local Docker)
 */

const { HindsightClient } = require('@vectorize-io/hindsight-client');

class HindsightService {
  constructor() {
    const baseUrl = process.env.HINDSIGHT_BASE_URL || 'http://localhost:8888';
    const apiKey  = process.env.HINDSIGHT_API_KEY  || undefined;

    const clientOptions = { baseUrl };
    if (apiKey) clientOptions.apiKey = apiKey;

    this.client = new HindsightClient(clientOptions);
    console.log(`[Hindsight] Initialised → ${baseUrl}`);
  }

  /**
   * Derive a stable, isolated bank ID for a given user.
   */
  _bankId(userId) {
    return `foundermind-${userId}`;
  }

  /**
   * Persist content to the founder's memory bank.
   * Hindsight automatically extracts facts, entities, and relationships.
   *
   * @param {string} userId  - Authenticated user ID
   * @param {string} content - Free-text or structured content to remember
   * @returns {Promise<boolean>}
   */
  async retainMemory(userId, content) {
    const bankId = this._bankId(userId);
    const start  = Date.now();
    try {
      await this.client.retain(bankId, content);
      console.log(`[Hindsight] ✓ retain userId=${userId} latency=${Date.now() - start}ms`);
      return true;
    } catch (err) {
      console.error(`[Hindsight] ✗ retain failed userId=${userId}:`, err.message);
      return false; // non-fatal – never break the chat flow
    }
  }

  /**
   * Recall relevant memories from the founder's bank based on a query.
   *
   * @param {string} userId - Authenticated user ID
   * @param {string} query  - The current user message or topic to recall against
   * @returns {Promise<Array<{fact: string, score?: number}>>}
   */
  async recallMemory(userId, query) {
    const bankId = this._bankId(userId);
    const start  = Date.now();
    try {
      const result = await this.client.recall(bankId, query);
      const latency = Date.now() - start;

      // Normalise the result into a consistent array of { fact, score } objects
      const memories = this._normaliseRecallResult(result);
      console.log(`[Hindsight] ✓ recall userId=${userId} hits=${memories.length} latency=${latency}ms`);
      return memories;
    } catch (err) {
      console.error(`[Hindsight] ✗ recall failed userId=${userId}:`, err.message);
      return []; // non-fatal – fall back to no memory context
    }
  }

  /**
   * Reflect (synthesise) insights from the founder's memory bank.
   * Useful for generating proactive recommendations.
   *
   * @param {string} userId - Authenticated user ID
   * @param {string} query  - The topic or question to reflect on
   * @returns {Promise<string>}
   */
  async reflectMemory(userId, query) {
    const bankId = this._bankId(userId);
    const start  = Date.now();
    try {
      const result = await this.client.reflect(bankId, query);
      console.log(`[Hindsight] ✓ reflect userId=${userId} latency=${Date.now() - start}ms`);
      return typeof result === 'string' ? result : result?.content || '';
    } catch (err) {
      console.error(`[Hindsight] ✗ reflect failed userId=${userId}:`, err.message);
      return '';
    }
  }

  /**
   * List all memories in the founder's bank (for the Memory dashboard page).
   *
   * @param {string} userId - Authenticated user ID
   * @returns {Promise<Array<{fact: string, score?: number}>>}
   */
  async listMemories(userId) {
    // Use a broad recall query to surface all stored facts
    return this.recallMemory(userId, 'Tell me everything you know about this founder and their startup');
  }

  /**
   * Manually add a fact to the founder's memory bank.
   *
   * @param {string} userId  - Authenticated user ID
   * @param {string} content - Fact or context to add
   * @returns {Promise<boolean>}
   */
  async addMemory(userId, content) {
    return this.retainMemory(userId, content);
  }

  /**
   * Normalise the raw Hindsight recall response into a consistent format.
   * Handles both SDK versions (array of strings, array of objects, nested result).
   *
   * @private
   */
  _normaliseRecallResult(result) {
    if (!result) return [];

    // Already an array
    if (Array.isArray(result)) {
      return result.map(item => ({
        fact: typeof item === 'string' ? item : (item.fact || item.content || item.text || JSON.stringify(item)),
        score: item.score || item.relevance_score || undefined,
      }));
    }

    // Object with a results / memories / facts key
    const list = result.results || result.memories || result.facts || result.chunks || [];
    if (Array.isArray(list)) {
      return list.map(item => ({
        fact: typeof item === 'string' ? item : (item.fact || item.content || item.text || JSON.stringify(item)),
        score: item.score || item.relevance_score || undefined,
      }));
    }

    // Single string response
    if (typeof result === 'string' && result.trim()) {
      return [{ fact: result }];
    }

    return [];
  }
}

module.exports = new HindsightService();
