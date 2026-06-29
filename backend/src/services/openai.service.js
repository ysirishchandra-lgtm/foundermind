/**
 * AI Service – Hybrid OpenAI / Ollama Client
 *
 * Production: Uses OpenAI cloud API (gpt-4o-mini / gpt-4o)
 * Development: Falls back to local Ollama if OPENAI_API_KEY not set
 *
 * Features:
 *   - Exponential back-off retry on transient failures
 *   - Streaming support via async generators
 *   - Token usage reporting
 *   - Configurable max_tokens for quality responses
 */

const OpenAI = require('openai');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
// Generous token limits for quality AI responses
const DEFAULT_MAX_TOKENS = 1500;
const STREAM_MAX_TOKENS  = 2048;
// Abort streaming after 45 seconds to prevent zombie connections
const STREAM_TIMEOUT_MS  = 45_000;

class OpenAIService {
  constructor() {
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    this.isCloud = hasApiKey;
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'ollama',
      baseURL: hasApiKey
        ? undefined
        : (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434/v1'),
      maxRetries: 0, // Handled manually with exponential back-off
    });
    this.defaultModel = process.env.OPENAI_MODEL ||
      (hasApiKey ? 'gpt-4o-mini' : 'qwen2.5-coder:1.5b');
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _isRetryable(error) {
    if (error instanceof OpenAI.APIConnectionError)  return true;
    if (error instanceof OpenAI.RateLimitError)      return true;
    if (error instanceof OpenAI.InternalServerError) return true;
    return false;
  }

  /**
   * Core non-streaming completion with retry + exponential back-off.
   */
  async generateResponse(messages, model = null) {
    const selectedModel = model || this.defaultModel;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const completion = await this.client.chat.completions.create({
          model: selectedModel,
          messages,
          temperature: 0.4,
          max_tokens: DEFAULT_MAX_TOKENS,
        });

        const choice = completion.choices[0];
        const usage  = completion.usage;

        return {
          content:           choice.message.content,
          model:             completion.model,
          tokens:            usage?.total_tokens      ?? 0,
          promptTokens:      usage?.prompt_tokens     ?? 0,
          completionTokens:  usage?.completion_tokens ?? 0,
          finishReason:      choice.finish_reason,
        };
      } catch (error) {
        lastError = error;

        if (!this._isRetryable(error) || attempt === MAX_RETRIES) break;

        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`[AI] Attempt ${attempt}/${MAX_RETRIES} failed (${error.constructor.name}). Retry in ${delay}ms…`);
        await this._sleep(delay);
      }
    }

    const message = lastError?.message || 'Unknown AI error';
    const err = new Error(`AI request failed after ${MAX_RETRIES} attempts: ${message}`);
    err.statusCode = lastError?.status || 502;
    throw err;
  }

  /**
   * Streaming completion — yields token chunks.
   * Times out after STREAM_TIMEOUT_MS to prevent zombie connections.
   *
   * @yields {string} Each token/chunk as it arrives
   */
  async *streamResponse(messages, model = null) {
    const selectedModel = model || this.defaultModel;
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), STREAM_TIMEOUT_MS);

    try {
      const stream = await this.client.chat.completions.create({
        model: selectedModel,
        messages,
        temperature: 0.4,
        max_tokens: STREAM_MAX_TOKENS,
        stream: true,
      }, { signal: abortController.signal });

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
        if (chunk.usage) {
          promptTokens     = chunk.usage.prompt_tokens     ?? 0;
          completionTokens = chunk.usage.completion_tokens ?? 0;
        }
        if (chunk.model) finalModel = chunk.model;
      }

      return {
        content: fullContent,
        model:   finalModel,
        tokens:  promptTokens + completionTokens,
        promptTokens,
        completionTokens,
        finishReason: 'stop',
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

module.exports = new OpenAIService();
