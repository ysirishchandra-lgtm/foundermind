import { Video, Calendar } from 'lucide-react';
import { mockMeetings } from '../../data/mockData';
import EmptyState from '../../components/EmptyState';

export default function Meetings() {
  return (
    <div className="animate-fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">Your upcoming schedule.</p>
        </div>
      </div>

      <div className="glass-card widget-card">
        <div className="widget-content">
          {mockMeetings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No meetings scheduled"
              description="Integrate your external calendar context inside settings to sync founder meetings."
            />
          ) : (
            mockMeetings.map(meeting => (
              <div key={meeting.id} className="list-item" style={{ padding: '20px' }}>
                <div className="item-left" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{meeting.date}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{meeting.time}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', paddingTop: '8px' }}>
                    <span className="item-title" style={{ fontSize: '1.1rem' }}>{meeting.title}</span>
                    <span className="item-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Video size={14}/> {meeting.attendees} attendees expected</span>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>Join Link</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
