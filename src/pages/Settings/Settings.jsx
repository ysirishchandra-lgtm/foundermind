import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences.</p>
      </div>

      <div className="glass-card widget-card" style={{ maxWidth: '600px' }}>
        <div className="widget-header">
          <div className="widget-title">Profile Information</div>
        </div>
        <div className="widget-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" defaultValue={user?.name || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" defaultValue={user?.email || ''} readOnly style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-8px' }}>
              Profile updates are coming in a future release. Your JWT identity is managed securely.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '8px', alignSelf: 'flex-start', opacity: 0.5, cursor: 'not-allowed' }} disabled>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
