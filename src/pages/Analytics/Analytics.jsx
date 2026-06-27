import { useState, useEffect } from 'react';
import { Activity, Clock, Coins, Cpu, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/analytics/dashboard');
      // response format: { success: true, data: { summary: {...}, modelDistribution: {...}, recentActivity: [...] } }
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message || 'Failed to load CascadeFlow analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const summary = data?.summary || {
    requestsToday: 0,
    averageLatencyMs: 0,
    totalTokensToday: 0,
    estimatedCostToday: 0.0,
  };

  const distribution = data?.modelDistribution || {};
  const recent = data?.recentActivity || [];

  // Calculate percentages for model distribution
  const totalModelCalls = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">AI Routing Analytics</h1>
          <p className="page-subtitle">CascadeFlow model performance, cost logs, and request routing context.</p>
        </div>
        <button 
          onClick={fetchAnalytics} 
          className="btn btn-secondary" 
          disabled={loading}
          style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Level Summary Cards */}
      <div className="widget-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Estimated Cost */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', borderRadius: '8px' }}>
            <Coins size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cost Incurred Today</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '4px' }}>
              ${summary.estimatedCostToday.toFixed(5)}
            </div>
          </div>
        </div>

        {/* Requests Today */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '8px' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Requests Today</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '4px' }}>
              {summary.requestsToday}
            </div>
          </div>
        </div>

        {/* Avg Latency */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Average Latency</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '4px' }}>
              {summary.averageLatencyMs} ms
            </div>
          </div>
        </div>

        {/* Token Consumption */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '8px' }}>
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tokens Today</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '4px' }}>
              {summary.totalTokensToday.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Model Distribution and Active Routing Policies */}
      <div className="widget-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Model Distribution */}
        <div className="glass-card widget-card">
          <div className="widget-header">
            <div className="widget-title">Model Distribution</div>
          </div>
          <div className="widget-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
            {totalModelCalls === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0', fontSize: '0.85rem' }}>
                No models have been routed today.
              </div>
            ) : (
              Object.entries(distribution).map(([model, count]) => {
                const percentage = ((count / totalModelCalls) * 100).toFixed(0);
                return (
                  <div key={model} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: '500' }}>{model}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{count} calls ({percentage}%)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${percentage}%`, 
                          background: model.includes('mini') ? 'var(--accent-blue)' : 'var(--accent-cyan)',
                          borderRadius: '4px'
                        }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active Policies */}
        <div className="glass-card widget-card" style={{ borderColor: 'rgba(6, 182, 212, 0.2)' }}>
          <div className="widget-header">
            <div className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} className="text-gradient" />
              <span>CascadeFlow Active System Rules</span>
            </div>
          </div>
          <div className="widget-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', fontSize: '0.82rem', maxHeight: '250px', overflowY: 'auto' }}>
            <div style={{ borderLeft: '2px solid var(--accent-blue)', paddingLeft: '12px' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>1. Greetings Intent (Regex Pattern)</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Matches greetings (hi, hello, hey). Routes to <code style={{ color: 'var(--accent-blue)' }}>gpt-4o-mini</code>.</div>
            </div>
            <div style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '12px' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>2. Strategy Intent (Keywords)</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Matches business keywords (pitch, funding, VC). Routes to <code style={{ color: 'var(--accent-cyan)' }}>gpt-4o</code>.</div>
            </div>
            <div style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '12px' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>3. Long Context Limit</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Matches history length &ge; 8. Escalates to <code style={{ color: 'var(--accent-cyan)' }}>gpt-4o</code> for accuracy.</div>
            </div>
            <div style={{ borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '12px' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>4. Default Fallback</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>All other general queries default to <code style={{ color: 'var(--accent-blue)' }}>gpt-4o-mini</code>.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Analytics Logs */}
      <div className="glass-card widget-card">
        <div className="widget-header">
          <div className="widget-title">Recent Routing Logs</div>
        </div>
        <div className="widget-content" style={{ overflowX: 'auto', padding: '0 16px 16px 16px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <LoaderSpinner />
            </div>
          ) : recent.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 0', fontSize: '0.85rem' }}>
              No recent logs found. Start chatting with the AI Chief of Staff.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <th style={{ padding: '12px 8px' }}>User Query</th>
                  <th style={{ padding: '12px 8px' }}>Model Used</th>
                  <th style={{ padding: '12px 8px' }}>Routing Rationale</th>
                  <th style={{ padding: '12px 8px' }}>Latency</th>
                  <th style={{ padding: '12px 8px' }}>Cost</th>
                  <th style={{ padding: '12px 8px' }}>Tokens</th>
                  <th style={{ padding: '12px 8px' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '12px 8px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.query_text}>
                      {log.query_text || '—'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem',
                        background: log.model_used.includes('mini') ? 'rgba(59, 130, 246, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                        color: log.model_used.includes('mini') ? 'var(--accent-blue)' : 'var(--accent-cyan)'
                      }}>
                        {log.model_used}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.routing_reason}>
                      {log.routing_reason || '—'}
                    </td>
                    <td style={{ padding: '12px 8px', color: log.latency_ms > 2000 ? '#f59e0b' : '#10b981' }}>
                      {log.latency_ms}ms
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: '500' }}>
                      ${(log.estimated_cost || 0).toFixed(5)}
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                      {log.total_tokens}
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function LoaderSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <RefreshCw size={24} className="spin" style={{ color: 'var(--accent-cyan)' }} />
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading metrics...</span>
    </div>
  );
}
