import { useState, useEffect } from 'react';
import { BrainCircuit, Search, Database, Plus, Loader, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export default function Memory() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Add memory state
  const [newFact, setNewFact] = useState('');
  const [addingFact, setAddingFact] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');
  const [addError, setAddError] = useState('');

  // Reflect state
  const [reflection, setReflection] = useState('');
  const [loadingReflection, setLoadingReflection] = useState(false);
  const [reflectionQuery, setReflectionQuery] = useState('What are the key operational bottlenecks, strategic priorities, and recommendations for this founder?');

  const fetchMemories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/memory');
      // response: { success: true, data: Array<{ fact: string, score: number }>, count: number }
      setMemories(response.data || []);
    } catch (err) {
      console.error('Failed to load memories:', err);
      setError(err.message || 'Failed to load persistent memories.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReflection = async () => {
    try {
      setLoadingReflection(true);
      const response = await api.get(`/memory/reflect?q=${encodeURIComponent(reflectionQuery)}`);
      // response: { success: true, data: { insight: string, query: string } }
      setReflection(response.data?.insight || 'No dynamic reflections generated yet. Populate your memory bank with more facts first!');
    } catch (err) {
      console.error('Failed to load reflection:', err);
      setReflection('Failed to retrieve AI deductions.');
    } finally {
      setLoadingReflection(false);
    }
  };

  useEffect(() => {
    fetchMemories();
    fetchReflection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddFact = async (e) => {
    e.preventDefault();
    if (!newFact.trim()) return;

    setAddingFact(true);
    setAddSuccess('');
    setAddError('');

    try {
      await api.post('/memory', { content: newFact.trim() });
      setAddSuccess('Fact added successfully! Hindsight is indexing the content.');
      setNewFact('');
      // Reload memories and reflection after short delay to let index process
      setTimeout(() => {
        fetchMemories();
        fetchReflection();
      }, 1000);
    } catch (err) {
      setAddError(err.message || 'Failed to store memory.');
    } finally {
      setAddingFact(false);
    }
  };

  // Filter memories based on search query
  const filteredMemories = memories.filter(item => 
    item.fact?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Founder Memory</h1>
        <p className="page-subtitle">Your persistent business context and AI-derived insights extracted by Hindsight Cloud.</p>
      </div>

      {/* Memory Search and Manual Addition Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {/* Search Memory */}
        <div className="glass-card" style={{ flex: '2 1 350px', padding: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '8px', width: '100%', border: '1px solid var(--border-color)' }}>
            <Search size={20} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search through stored founder memories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.95rem' }} 
            />
          </div>
        </div>

        {/* Add Memory Form */}
        <div className="glass-card" style={{ flex: '1 1 300px', padding: '20px' }}>
          <form onSubmit={handleAddFact} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Add key business fact (e.g. Current ARR is $1.5M)"
              value={newFact}
              onChange={(e) => setNewFact(e.target.value)}
              disabled={addingFact}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: 'white',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={addingFact || !newFact.trim()}
              style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
            >
              {addingFact ? <Loader size={16} className="spin" /> : <Plus size={16} />} Add
            </button>
          </form>
          {addSuccess && <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '8px', marginBlockEnd: 0 }}>{addSuccess}</p>}
          {addError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '8px', marginBlockEnd: 0 }}>{addError}</p>}
        </div>
      </div>

      {/* Grid of Stored Memory and Reflection */}
      <div className="widget-grid">
        {/* Core Business Context (from Hindsight) */}
        <div className="glass-card widget-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="widget-header">
            <div className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} className="text-secondary" />
              <span>Core Business Context</span>
            </div>
            <button 
              onClick={fetchMemories} 
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
          <div className="widget-content" style={{ flex: 1, maxHeight: '450px', overflowY: 'auto', padding: '16px' }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.85rem' }}>{error}</span>
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                <Loader size={24} className="spin" style={{ color: 'var(--text-secondary)' }} />
              </div>
            ) : filteredMemories.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', color: 'var(--text-secondary)', textAlign: 'center', gap: '10px' }}>
                <Database size={36} style={{ opacity: 0.3 }} />
                <span style={{ fontSize: '0.85rem' }}>
                  {searchQuery ? 'No memories match your search query.' : 'No memories stored in Hindsight Cloud yet.\nStart chatting or add key facts above.'}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredMemories.map((item, idx) => (
                  <div key={idx} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
                    <span className="item-title" style={{ fontSize: '0.92rem', lineHeight: '1.4' }}>{item.fact}</span>
                    {item.score && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: '4px', opacity: 0.8 }}>
                        Relevance: {(item.score * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Deductions / Reflections */}
        <div className="glass-card widget-card" style={{ borderColor: 'var(--accent-cyan)', display: 'flex', flexDirection: 'column' }}>
          <div className="widget-header">
            <div className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BrainCircuit size={18} className="text-gradient" />
              <span>AI Strategic Insights</span>
            </div>
            <button 
              onClick={fetchReflection} 
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} className={loadingReflection ? 'spin' : ''} /> Synthesise
            </button>
          </div>
          <div className="widget-content" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Insight Goal/Focus:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={reflectionQuery}
                  onChange={(e) => setReflectionQuery(e.target.value)}
                  placeholder="e.g. Strategic priorities, bottlenecks..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            <div 
              style={{ 
                flex: 1, 
                background: 'rgba(6, 182, 212, 0.03)', 
                border: '1px solid rgba(6, 182, 212, 0.1)', 
                borderRadius: '8px', 
                padding: '16px', 
                overflowY: 'auto',
                maxHeight: '340px'
              }}
            >
              {loadingReflection ? (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '12px' }}>
                  <Loader size={24} className="spin" style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Synthesising memories...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Sparkles size={16} className="text-gradient" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {reflection}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
