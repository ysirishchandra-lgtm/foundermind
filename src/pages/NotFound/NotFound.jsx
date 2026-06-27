import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="app-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-color)',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div
        className="glass-card animate-fade-up"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <div
          style={{
            padding: '20px',
            background: 'rgba(6, 182, 212, 0.05)',
            borderRadius: '50%',
            border: '1px solid rgba(6, 182, 212, 0.1)',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HelpCircle size={48} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>404</h1>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Page Not Found</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            The page you are looking for doesn&apos;t exist or has been relocated by the Chief of Staff.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
          style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}
        >
          Go to Dashboard <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
