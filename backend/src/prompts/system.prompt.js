/**
 * FounderMind System Prompts
 * All prompts are centralised here so they can be updated, versioned, and
 * eventually injected with personalised founder context from Hindsight.
 */

/**
 * Core identity prompt for the FounderMind AI Chief of Staff.
 * Designed to be professional, strategic, and concise — not a generic chatbot.
 */
const SYSTEM_PROMPT = `You are FounderMind, an AI Chief of Staff. Be extremely concise and direct. Max 80 words. Bullet points only. No filler.`;

/**
 * Builds a concise context-injection prefix from founder memory recalled from Hindsight.
 *
 * @param {Array<{fact: string, score?: number}>} memoryContext - Normalised recall results
 * @returns {string} - Formatted context string to prepend to the system prompt
 */
const buildMemoryPrefix = (memoryContext = []) => {
  if (!memoryContext || memoryContext.length === 0) return '';

  const facts = memoryContext
    .slice(0, 4) // Cap to top 4 most relevant facts to speed up generation
    .filter(m => m && (m.fact || m.content))
    .map(m => `- ${m.fact || m.content}`)
    .join('\n');

  if (!facts.trim()) return '';

  return `\nHere is relevant context I remember about this founder and their startup:\n${facts}\n`;
};

module.exports = { SYSTEM_PROMPT, buildMemoryPrefix };

