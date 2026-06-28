/**
 * FounderMind System Prompts
 * All prompts are centralised here so they can be updated, versioned, and
 * eventually injected with personalised founder context from Hindsight.
 */

/**
 * Core identity prompt for the FounderMind AI Chief of Staff.
 * Designed to be professional, strategic, and concise — not a generic chatbot.
 */
const SYSTEM_PROMPT = `You are FounderMind, an AI Chief of Staff for startup founders. Be direct, concise, and strategic. No filler. Give actionable answers. Use bullet points for clarity. Keep responses under 200 words unless asked for more.`;

/**
 * Builds a concise context-injection prefix from founder memory recalled from Hindsight.
 *
 * @param {Array<{fact: string, score?: number}>} memoryContext - Normalised recall results
 * @returns {string} - Formatted context string to prepend to the system prompt
 */
const buildMemoryPrefix = (memoryContext = []) => {
  if (!memoryContext || memoryContext.length === 0) return '';

  const facts = memoryContext
    .filter(m => m && (m.fact || m.content))
    .map(m => `- ${m.fact || m.content}`)
    .join('\n');

  if (!facts.trim()) return '';

  return `\nHere is relevant context I remember about this founder and their startup:\n${facts}\n`;
};

module.exports = { SYSTEM_PROMPT, buildMemoryPrefix };

