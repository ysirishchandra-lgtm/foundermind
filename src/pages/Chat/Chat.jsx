import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User, Brain, Plus, Trash2, Loader, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Chat.css';

export default function Chat() {
  const { user } = useAuth();

  // ── Conversations ───────────────────────────────────────────────────────
  const [conversations,   setConversations]   = useState([]);
  const [activeConvId,    setActiveConvId]    = useState(null);
  const [loadingConvs,    setLoadingConvs]    = useState(true);

  // ── Messages ────────────────────────────────────────────────────────────
  const [messages,        setMessages]        = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // ── Input / Sending ─────────────────────────────────────────────────────
  const [input,           setInput]           = useState('');
  const [sending,         setSending]         = useState(false);
  const [error,           setError]           = useState('');

  const messagesEndRef = useRef(null);

  // ── Load conversations on mount ─────────────────────────────────────────
  useEffect(() => {
    fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-scroll to latest message ───────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      const data = await api.get('/conversations?limit=20');
      const convs = data.data || [];
      setConversations(convs);

      // Auto-select the most recent conversation, or create one if none exist
      if (convs.length > 0) {
        selectConversation(convs[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err.message);
    } finally {
      setLoadingConvs(false);
    }
  };

  const selectConversation = useCallback(async (convId) => {
    if (convId === activeConvId) return;
    setActiveConvId(convId);
    setMessages([]);
    setError('');

    try {
      setLoadingMessages(true);
      const data = await api.get(`/messages/${convId}?limit=50`);
      // Messages come back newest-first from API, so reverse for display
      const msgs = (data.data || []).reverse();
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err.message);
      setError('Failed to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  }, [activeConvId]);

  const createNewConversation = async () => {
    try {
      const title = `Chat – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
      const data  = await api.post('/conversations', { title });
      const newConv = data.data;
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setMessages([]);
      setError('');
    } catch (err) {
      console.error('Failed to create conversation:', err.message);
    }
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/conversations/${convId}`);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (activeConvId === convId) {
        setActiveConvId(null);
        setMessages([]);
        if (remaining.length > 0) selectConversation(remaining[0].id);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err.message);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    // Ensure there's an active conversation
    let convId = activeConvId;
    if (!convId) {
      try {
        const title = `Chat – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        const data = await api.post('/conversations', { title });
        convId = data.data.id;
        setConversations(prev => [data.data, ...prev]);
        setActiveConvId(convId);
      } catch {
        setError('Failed to start conversation. Please try again.');
        return;
      }
    }

    const userText = input.trim();
    setInput('');
    setError('');

    // Optimistic UI: show user message immediately
    const optimisticMsg = {
      id: `optimistic-${Date.now()}`,
      role: 'user',
      content: userText,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setSending(true);

    try {
      const data = await api.post('/chat', { conversationId: convId, message: userText });
      const { userMessage, assistantMessage, meta: _meta } = data.data;

      // Replace optimistic message with real one + add AI response
      setMessages(prev => [
        ...prev.filter(m => m.id !== optimisticMsg.id),
        userMessage,
        assistantMessage,
      ]);

      // Update conversation updated_at in sidebar
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, updated_at: new Date().toISOString() } : c)
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      );

    } catch (err) {
      setError(err.message || 'Failed to get AI response. Please try again.');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="chat-layout animate-fade-up">
      {/* Sidebar – Conversation List */}
      <div className="chat-history-sidebar glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Conversations</h3>
          <button
            className="btn btn-primary"
            onClick={createNewConversation}
            style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="New conversation"
          >
            <Plus size={14} /> New
          </button>
        </div>

        {loadingConvs ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Loader size={20} className="spin" style={{ color: 'var(--text-secondary)' }} />
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <MessageSquare size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <p>No conversations yet.<br />Start your first chat!</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={`history-item ${conv.id === activeConvId ? 'active' : ''}`}
              onClick={() => selectConversation(conv.id)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontSize: '0.875rem' }}>
                {conv.title}
              </span>
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px', flexShrink: 0, opacity: 0 }}
                className="delete-conv-btn"
                title="Delete conversation"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Main Chat Area */}
      <div className="chat-main glass-card">
        {/* Messages */}
        <div className="chat-messages">
          {!activeConvId && !loadingConvs && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--text-secondary)' }}>
              <Brain size={48} style={{ opacity: 0.3 }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Welcome, {user?.name?.split(' ')[0] || 'Founder'}</p>
                <p style={{ fontSize: '0.9rem' }}>Start a new conversation or select one from the sidebar.</p>
              </div>
            </div>
          )}

          {loadingMessages && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <Loader size={24} className="spin" style={{ color: 'var(--text-secondary)' }} />
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.role === 'user' ? 'student' : 'tutor'}`}>
              <div className={`chat-avatar ${msg.role === 'user' ? 'avatar-student' : 'avatar-tutor'}`}>
                {msg.role === 'user' ? <User size={18} /> : <Brain size={18} />}
              </div>
              <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Thinking indicator while sending */}
          {sending && (
            <div className="chat-message tutor">
              <div className="chat-avatar avatar-tutor">
                <Brain size={18} />
              </div>
              <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Loader size={14} className="spin" /> Thinking...
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '12px 16px', margin: '8px 0', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            id="chat-input"
            type="text"
            className="chat-input"
            placeholder={activeConvId ? 'Ask your Chief of Staff...' : 'Start typing to begin a new chat...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <button
            id="chat-send"
            type="submit"
            className="btn btn-primary send-btn"
            disabled={sending || !input.trim()}
          >
            {sending ? <Loader size={18} className="spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
