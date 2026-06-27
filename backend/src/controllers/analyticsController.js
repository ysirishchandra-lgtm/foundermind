/**
 * Analytics Controller – Milestone 6
 *
 * Aggregates model usage metrics and costs for the logged-in user.
 */

const supabase = require('../config/db');

/**
 * GET /api/analytics/dashboard
 * Retrieves today's total cost, token count, average latency, model distribution, and recent activity.
 */
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Start of today in UTC
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const startOfTodayISO = startOfToday.toISOString();

    // 1. Fetch all of today's records for calculation
    const { data: todayRecords, error: todayError } = await supabase
      .from('ai_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfTodayISO);

    if (todayError) {
      throw todayError;
    }

    // 2. Fetch the 10 most recent records overall (not restricted to today, for historic context)
    const { data: recentRecords, error: recentError } = await supabase
      .from('ai_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      throw recentError;
    }

    // Initialize metrics
    let requestsToday = 0;
    let totalTokensToday = 0;
    let estimatedCostToday = 0.0;
    let totalLatencyToday = 0;
    let averageLatencyToday = 0;
    const modelDistribution = {};

    if (todayRecords && todayRecords.length > 0) {
      requestsToday = todayRecords.length;
      
      todayRecords.forEach(record => {
        totalTokensToday += (record.total_tokens || 0);
        estimatedCostToday += parseFloat(record.estimated_cost || 0.0);
        totalLatencyToday += (record.latency_ms || 0);
        
        // Model usage tally
        const model = record.model_used || 'unknown';
        modelDistribution[model] = (modelDistribution[model] || 0) + 1;
      });

      averageLatencyToday = Math.round(totalLatencyToday / requestsToday);
    }

    // Structure response
    res.status(200).json({
      success: true,
      data: {
        summary: {
          requestsToday,
          averageLatencyMs: averageLatencyToday,
          totalTokensToday,
          estimatedCostToday: parseFloat(estimatedCostToday.toFixed(6)),
        },
        modelDistribution,
        recentActivity: recentRecords || []
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardData };
