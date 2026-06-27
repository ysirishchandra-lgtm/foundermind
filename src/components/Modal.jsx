import { X } from 'lucide-react';

export default function Modal({ isOpen, title, onClose, children, maxWidth = '500px' }) {
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
        zIndex: 9999,
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fade-up"
        style={{
          width: '100%',
          maxWidth,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
