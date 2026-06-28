/**
 * AI Service – Ollama (Local, 100% Free)
 *
 * Uses your locally-installed Ollama AI models.
 * No API key needed. No internet. No payment. Runs on your own PC!
 *
 * Features:
 *   - Configurable model via environment variable
 *   - Graceful error handling
 *   - Retry logic for transient failures
 *   - Full token usage reporting
 */

const OpenAI = require('openai');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

class OpenAIService {
  constructor() {
    // Ollama exposes an OpenAI-compatible API at localhost:11434
    // No API key needed for local Ollama!
    this.client = new OpenAI({
      apiKey: 'ollama', // Ollama doesn't need a real key, just a non-empty string
      baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
      maxRetries: 0,
    });
    this.defaultModel = process.env.OPENAI_MODEL || 'qwen2.5-coder:1.5b';
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
          temperature: 0.3,
          max_tokens: 512,
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
  /**
   * Streaming completion – yields tokens as they arrive.
   * The caller is responsible for writing SSE chunks to the response.
   *
   * @param {Array<{role, content}>} messages
   * @param {string|null} model
   * @yields {string} Each token/chunk as it arrives
   * @returns {{ tokens: number, promptTokens: number, completionTokens: number, model: string }}
   */
  async *streamResponse(messages, model = null) {
    const selectedModel = model || this.defaultModel;

    const stream = await this.client.chat.completions.create({
      model: selectedModel,
      messages,
      temperature: 0.3,
      max_tokens: 512,
      stream: true,
    });

    let fullContent = '';
    let promptTokens = 0;
    let completionTokens = 0;
    let finalModel = selectedModel;

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        fullContent += delta;
        yield delta;
      }
      // Capture usage if provided in final chunk
      if (chunk.usage) {
        promptTokens = chunk.usage.prompt_tokens ?? 0;
        completionTokens = chunk.usage.completion_tokens ?? 0;
      }
      if (chunk.model) finalModel = chunk.model;
    }

    return {
      content: fullContent,
      model: finalModel,
      tokens: promptTokens + completionTokens,
      promptTokens,
      completionTokens,
      finishReason: 'stop',
    };
  }
}

module.exports = new OpenAIService();
