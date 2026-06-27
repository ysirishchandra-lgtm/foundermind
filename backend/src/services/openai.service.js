/**
 * OpenAI Service – Milestone 4
 *
 * Production-ready wrapper around the OpenAI Node SDK.
 * Features:
 *   - Configurable model via environment variable
 *   - Graceful error handling with typed error classes
 *   - Retry logic for transient (rate-limit / network) failures
 *   - Full token usage reporting
 *   - Streaming-ready architecture (swap stream: false → true when ready)
 */

const OpenAI = require('openai');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // base delay, doubles on each retry

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 0, // we handle retries ourselves for better observability
    });
    this.defaultModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  /**
   * Sleep helper for retry back-off.
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Classify whether an OpenAI error is worth retrying.
   */
  _isRetryable(error) {
    if (error instanceof OpenAI.APIConnectionError) return true;
    if (error instanceof OpenAI.RateLimitError) return true;
    if (error instanceof OpenAI.InternalServerError) return true;
    return false;
  }

  /**
   * Core completion call with retry logic.
   *
   * @param {Array<{role: string, content: string}>} messages - Full message history
   * @param {string} model - Model override (default: OPENAI_MODEL env var)
   * @returns {{ content: string, model: string, tokens: number, promptTokens: number, completionTokens: number }}
   */
  async generateResponse(messages, model = null) {
    const selectedModel = model || this.defaultModel;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const completion = await this.client.chat.completions.create({
          model: selectedModel,
          messages,
          temperature: 0.7,
          // stream: false,  // flip to true for streaming (Milestone 6+)
        });

        const choice = completion.choices[0];
        const usage = completion.usage;

        return {
          content: choice.message.content,
          model: completion.model,
          tokens: usage?.total_tokens ?? 0,
          promptTokens: usage?.prompt_tokens ?? 0,
          completionTokens: usage?.completion_tokens ?? 0,
          finishReason: choice.finish_reason,
        };
      } catch (error) {
        lastError = error;

        if (!this._isRetryable(error) || attempt === MAX_RETRIES) {
          break;
        }

        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`[OpenAI] Attempt ${attempt} failed (${error.constructor.name}). Retrying in ${delay}ms...`);
        await this._sleep(delay);
      }
    }

    // Surface a clean error after all retries exhausted
    const message = lastError?.message || 'Unknown OpenAI error';
    const err = new Error(`OpenAI request failed after ${MAX_RETRIES} attempts: ${message}`);
    err.statusCode = lastError?.status || 502;
    throw err;
  }
}

module.exports = new OpenAIService();
