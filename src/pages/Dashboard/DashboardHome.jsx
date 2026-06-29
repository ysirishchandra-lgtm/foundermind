import { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  BrainCircuit, 
  ArrowRight,
  Brain,
  Plus,
  Coins,
  Cpu,
  Clock
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [chats, setChats] = useState([]);
  const [memories, setMemories] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Perform parallel requests
      const [tasksRes, chatsRes, memoriesRes, analyticsRes, meetingsRes] = await Promise.allSettled([
        api.get('/tasks?status=todo&limit=3'),
        api.get('/conversations?limit=3'),
        api.get('/memory'),
        api.get('/analytics/dashboard'),
        api.get('/meetings?limit=3'),
      ]);

      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data || []);
      if (chatsRes.status === 'fulfilled') setChats(chatsRes.value.data || []);
      if (memoriesRes.status === 'fulfilled') setMemories(memoriesRes.value.data || []);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
      if (meetingsRes.status === 'fulfilled') setMeetings(meetingsRes.value.data || []);

    } catch (err) {
      console.error('Error fetching dashboard content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = user?.name?.split(' ')[0] || 'Founder';
  const displayCompany = user?.company || 'your Startup';

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Welcome Back, {displayName}</h1>
        <p className="page-subtitle">Here&apos;s a live overview of {displayCompany} today.</p>
      </div>

      {/* Analytics Summary Row */}
      <div className="widget-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '8px' }}>
        {/* Cost widget */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', borderRadius: '8px' }}>
            <Coins size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Spend Today</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '2px' }}>
              {loading ? <Skeleton width="60px" height="20px" /> : `$${(analytics?.summary?.estimatedCostToday || 0).toFixed(5)}`}
            </div>
          </div>
        </div>

        {/* Requests widget */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '8px' }}>
            <Cpu size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Routed Requests</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '2px' }}>
              {loading ? <Skeleton width="40px" height="20px" /> : analytics?.summary?.requestsToday || 0}
            </div>
          </div>
        </div>

        {/* Latency widget */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Latency</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '2px' }}>
              {loading ? <Skeleton width="50px" height="20px" /> : `${analytics?.summary?.averageLatencyMs || 0} ms`}
            </div>
          </div>
        </div>
      </div>

      {/* Split widgets: Priorities vs Meetings */}
      <div className="widget-grid">
        {/* Today's Priorities (Live Tasks) */}
        <div className="glass-card widget-card">
          <div className="widget-header">
            <div className="widget-title"><CheckSquare size={18} /> Today&apos;s Priorities</div>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => navigate('/dashboard/tasks')}>View All</button>
          </div>
          <div className="widget-content">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                <Skeleton height="35px" />
                <Skeleton height="35px" />
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState 
                title="Zero priorities left!" 
                description="Create actionable items to coordinate your startup launch." 
                actionText="Create Task" 
                onAction={() => navigate('/dashboard/tasks')} 
              />
            ) : (
              tasks.map(task => (
                <div key={task.id} className="list-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/tasks')}>
                  <div className="item-left">
                    <span className="item-title">{task.title}</span>
                  </div>
                  <span className="item-status" style={{ 
                    background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                    color: task.priority === 'high' ? '#ef4444' : '#f59e0b' 
                  }}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Meetings Widget */}
        <div className="glass-card widget-card">
          <div className="widget-header">
            <div className="widget-title"><Calendar size={18} /> Upcoming Meetings</div>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => navigate('/dashboard/meetings')}>View All</button>
          </div>
          <div className="widget-content">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                <Skeleton height="35px" />
                <Skeleton height="35px" />
              </div>
            ) : meetings.length === 0 ? (
              <EmptyState
                title="No meetings scheduled"
                description="Add a meeting to stay on top of your schedule."
                actionText="Schedule Meeting"
                onAction={() => navigate('/dashboard/meetings')}
              />
            ) : (
              meetings.map(meeting => (
                <div key={meeting.id} className="list-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/meetings')}>
                  <div className="item-left">
                    <span className="item-title">{meeting.title}</span>
                    <span className="item-meta">{meeting.date} · {meeting.time} · {meeting.attendees} attendees</span>
                  </div>
                  <ArrowRight size={16} className="text-secondary" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Split widgets: Recent Chats vs AI Memory Context */}
      <div className="widget-grid">
        {/* Recent Chats Widget */}
        <div className="glass-card widget-card">
          <div className="widget-header">
            <div className="widget-title"><MessageSquare size={18} /> Recent AI Chats</div>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => navigate('/dashboard/chat')}>New Chat</button>
          </div>
          <div className="widget-content">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                <Skeleton height="40px" />
                <Skeleton height="40px" />
              </div>
            ) : chats.length === 0 ? (
              <EmptyState 
                title="No chat logs" 
                description="Start a continuous chat to let the Chief of Staff organize your workspace." 
                actionText="Start Conversation" 
                onAction={() => navigate('/dashboard/chat')} 
              />
            ) : (
              chats.map(chat => (
                <div key={chat.id} className="list-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/chat')}>
                  <div className="item-left">
                    <span className="item-title">{chat.title}</span>
                    <span className="item-meta">Updated {new Date(chat.updated_at).toLocaleDateString()}</span>
                  </div>
                  <ArrowRight size={16} className="text-secondary" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Memory Context */}
        <div className="glass-card widget-card" style={{ borderColor: 'var(--accent-cyan)' }}>
          <div className="widget-header">
            <div className="widget-title"><BrainCircuit size={18} className="text-gradient" /> AI Memory Summary</div>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => navigate('/dashboard/memory')}>Manage</button>
          </div>
          <div className="widget-content">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                <Skeleton height="30px" />
                <Skeleton height="30px" />
              </div>
            ) : memories.length === 0 ? (
              <EmptyState 
                title="FounderMind hasn&apos;t learned anything about you yet" 
                description="Start chatting to build your persistent memory bank context." 
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
                {memories.slice(0, 2).map((m, idx) => (
                  <div key={idx} className="list-item" style={{ padding: '10px 12px', background: 'rgba(6, 182, 212, 0.02)', borderColor: 'rgba(6, 182, 212, 0.1)', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.85rem' }}>{m.fact}</span>
                  </div>
                ))}
                {memories.length > 2 && (
                  <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    And {memories.length - 2} more stored facts
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action CTAs */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Quick Actions</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard/chat')} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            <MessageSquare size={16} /> Start Chat
          </button>
          <button onClick={() => navigate('/dashboard/tasks')} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
            <Plus size={16} /> New Task
          </button>
          <button onClick={() => navigate('/dashboard/memory')} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
            <Brain size={16} /> Add Memory Fact
          </button>
        </div>
      </div>
    </div>
  );
}
