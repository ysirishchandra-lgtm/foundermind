export default function EmptyState({ icon: Icon, title, description, actionText, onAction, style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 24px',
        color: 'var(--text-secondary)',
        gap: '16px',
        ...style,
      }}
    >
      {Icon && (
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', border: '1px solid var(--border-color)' }}>
          <Icon size={32} style={{ color: 'var(--text-secondary)', opacity: 0.7 }} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>{title}</h4>
        <p style={{ fontSize: '0.85rem', maxWidth: '300px', lineHeight: '1.5' }}>{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
