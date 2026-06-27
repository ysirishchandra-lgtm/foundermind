import { Loader } from 'lucide-react';

export default function LoadingSpinner({ size = 24, message = 'Loading...', style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '24px',
        color: 'var(--text-secondary)',
        ...style,
      }}
    >
      <Loader size={size} className="spin" style={{ color: 'var(--accent-cyan)' }} />
      {message && <span style={{ fontSize: '0.85rem' }}>{message}</span>}
    </div>
  );
}
