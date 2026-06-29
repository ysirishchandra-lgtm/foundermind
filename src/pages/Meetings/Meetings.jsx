import { useState, useEffect } from 'react';
import { Video, Calendar, Plus, Trash2, Edit2, X, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/EmptyState';

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [joinLink, setJoinLink] = useState('');

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/meetings');
      setMeetings(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch meetings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setCurrentMeeting(null);
    setTitle('');
    setDate('');
    setTime('');
    setAttendees(1);
    setJoinLink('');
    setShowModal(true);
  };

  const handleOpenEdit = (meeting) => {
    setCurrentMeeting(meeting);
    setTitle(meeting.title);
    setDate(meeting.date);
    setTime(meeting.time);
    setAttendees(meeting.attendees);
    setJoinLink(meeting.join_link || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date.trim() || !time.trim()) return;

    try {
      setSaving(true);
      const fields = {
        title,
        date,
        time,
        attendees: Number(attendees),
        join_link: joinLink
      };

      if (currentMeeting) {
        await api.patch(`/meetings/${currentMeeting.id}`, fields);
        showNotification('Meeting updated successfully!');
      } else {
        await api.post('/meetings', fields);
        showNotification('Meeting scheduled successfully!');
      }
      setShowModal(false);
      fetchMeetings();
    } catch (err) {
      alert(err.message || 'Error saving meeting.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (meetingId) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;
    try {
      await api.delete(`/meetings/${meetingId}`);
      showNotification('Meeting cancelled.');
      fetchMeetings();
    } catch (err) {
      alert(err.message || 'Error deleting meeting.');
    }
  };

  return (
    <div className="animate-fade-up" style={{ position: 'relative' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'rgba(16, 185, 129, 0.9)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'fade-in 0.3s ease'
        }}>
          {notification}
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">Your upcoming schedule.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Schedule Meeting
        </button>
      </div>

      {loading ? (
        <div className="glass-card widget-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
          <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--accent-blue)' }} />
        </div>
      ) : error ? (
        <div className="glass-card widget-card" style={{ padding: '24px', color: '#ef4444', textAlign: 'center' }}>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchMeetings} style={{ marginTop: '12px' }}>Retry</button>
        </div>
      ) : (
        <div className="glass-card widget-card">
          <div className="widget-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {meetings.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No meetings scheduled"
                description="Integrate your external calendar context inside settings to sync founder meetings."
              />
            ) : (
              meetings.map(meeting => (
                <div key={meeting.id} className="list-item" style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="item-left" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '20px' }}>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', minWidth: '80px' }}>
                      <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{meeting.date}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{meeting.time}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', paddingTop: '8px' }}>
                      <span className="item-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{meeting.title}</span>
                      <span className="item-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                        <Video size={14}/> {meeting.attendees} attendees expected
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {meeting.join_link && (
                      <a href={meeting.join_link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.9rem', textDecoration: 'none' }}>
                        Join Link
                      </a>
                    )}
                    <button className="btn-icon" onClick={() => handleOpenEdit(meeting)} style={{ color: 'rgba(255,255,255,0.7)' }}><Edit2 size={18} /></button>
                    <button className="btn-icon" onClick={() => handleDelete(meeting.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Glassmorphic Modal Form */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {currentMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Meeting Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Strategy Review"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Date</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. Jun 30, Today"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Attendees Expected</label>
                <input
                  type="number"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  min="1"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Video Call Link (Optional)</label>
                <input
                  type="text"
                  value={joinLink}
                  onChange={(e) => setJoinLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '8px 24px' }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
