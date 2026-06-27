import { X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '24px',
      }}
    >
      <div
        className="glass-card animate-fade-up"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{title}</h3>
          <button onClick={onCancel} style={{ color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#ef4444', boxShadow: 'none' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
