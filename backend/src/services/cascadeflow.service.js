/**
 * CascadeFlow Service – Milestone 6
 *
 * Implements model cascading, latency/budget optimization, fallback logic,
 * and cost tracking based on the routing rules in cascadeflow.config.json.
 */

const path = require('path');
const fs = require('fs');
const { CascadeAgent } = require('@cascadeflow/core');
const supabase = require('../config/db');

class CascadeFlowService {
  constructor() {
    this.configPath = path.join(__dirname, '../config/cascadeflow.config.json');
    this.loadConfig();
    this.initAgent();
  }

  loadConfig() {
    try {
      const content = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(content);
      console.log('[CascadeFlow] Configuration loaded successfully.');
    } catch (err) {
      console.error('[CascadeFlow] Failed to load config, using defaults:', err.message);
      this.config = {
        models: [
          { name: 'gpt-4o-mini', provider: 'openai', costPerInputToken: 0.00000015, costPerOutputToken: 0.0000006, fallback: 'gpt-4o' },
          { name: 'gpt-4o', provider: 'openai', costPerInputToken: 0.0000025, costPerOutputToken: 0.000010, fallback: 'gpt-4o-mini' }
        ],
        routingRules: [
          { name: 'default', model: 'gpt-4o-mini', reason: 'Default fallback rule.' }
        ],
        budgets: { dailyLimitUSD: 5.0 }
      };
    }
  }

  initAgent() {
    try {
      // Map config models to SDK spec
      const sdkModels = this.config.models.map(m => ({
        name: m.name,
        provider: m.provider,
        cost: m.costPerInputToken * 1000000, // cost per million tokens
        apiKey: process.env.OPENAI_API_KEY
      }));

      this.agent = new CascadeAgent({
        models: sdkModels
      });
      console.log('[CascadeFlow] SDK CascadeAgent initialized.');
    } catch (err) {
      console.warn('[CascadeFlow] SDK initialization failed, utilizing rule-based routing:', err.message);
    }
  }

  /**
   * Routes a user prompt based on query content and conversation history.
   *
   * @param {string} query - Current user input
   * @param {Array} history - Past message array
   * @returns {{ model: string, reason: string, ruleName: string }}
   */
  routeRequest(query, history = []) {
    const cleanQuery = (query || '').trim().toLowerCase();
    
    // Evaluate matching rules sequentially
    for (const rule of this.config.routingRules) {
      // 1. Regex pattern check
      if (rule.pattern) {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(cleanQuery)) {
          return {
            model: rule.model,
            reason: rule.reason,
            ruleName: rule.name
          };
        }
      }

      // 2. Keywords check
      if (rule.keywords && rule.keywords.length > 0) {
        const matchesKeyword = rule.keywords.some(kw => cleanQuery.includes(kw.toLowerCase()));
        if (matchesKeyword) {
          return {
            model: rule.model,
            reason: rule.reason,
            ruleName: rule.name
          };
        }
      }

      // 3. Context history check
      if (rule.minHistoryLength !== undefined) {
        if (history.length >= rule.minHistoryLength) {
          return {
            model: rule.model,
            reason: rule.reason,
            ruleName: rule.name
          };
        }
      }
    }

    // Default fallback rule if nothing matches
    const defaultRule = this.config.routingRules.find(r => r.name === 'default') || {
      model: 'gpt-4o-mini',
      reason: 'General query routed to cost-effective default model.',
      name: 'default'
    };

    return {
      model: defaultRule.model,
      reason: defaultRule.reason,
      ruleName: defaultRule.name
    };
  }

  /**
   * Fetches the fallback model for a given model if it fails.
   */
  getFallbackModel(modelName) {
    const modelMeta = this.config.models.find(m => m.name === modelName);
    return modelMeta?.fallback || 'gpt-4o-mini';
  }

  /**
   * Calculates the estimated cost in USD.
   */
  calculateEstimatedCost(modelName, promptTokens, completionTokens) {
    const modelMeta = this.config.models.find(m => m.name === modelName);
    if (!modelMeta) return 0.0;
    
    const inputCost = promptTokens * modelMeta.costPerInputToken;
    const outputCost = completionTokens * modelMeta.costPerOutputToken;
    return inputCost + outputCost;
  }

  /**
   * Persists routing statistics to Supabase database.
   */
  async logAnalytics(userId, conversationId, data) {
    try {
      const estimatedCost = this.calculateEstimatedCost(
        data.modelUsed, 
        data.promptTokens, 
        data.completionTokens
      );

      const payload = {
        user_id: userId,
        conversation_id: conversationId || null,
        model_used: data.modelUsed,
        query_text: data.queryText || null,
        routing_reason: data.routingReason || null,
        prompt_tokens: data.promptTokens || 0,
        completion_tokens: data.completionTokens || 0,
        total_tokens: (data.promptTokens || 0) + (data.completionTokens || 0),
        estimated_cost: parseFloat(estimatedCost.toFixed(8)),
        latency_ms: data.latencyMs || 0
      };

      const { error } = await supabase
        .from('ai_analytics')
        .insert([payload]);

      if (error) {
        console.error('[CascadeFlow] Error inserting analytics logs:', error.message);
      } else {
        console.log(`[CascadeFlow] Analytics logged for userId=${userId} cost=$${payload.estimated_cost}`);
      }
    } catch (err) {
      console.error('[CascadeFlow] Exception in logAnalytics:', err.message);
    }
  }
}

module.exports = new CascadeFlowService();
