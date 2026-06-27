import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'An error occurred.', onRetry, style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 24px',
        color: '#ef4444',
        gap: '16px',
        ...style,
      }}
    >
      <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '50%', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <AlertTriangle size={32} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Connection Error</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: '1.5' }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
