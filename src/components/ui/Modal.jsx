export default function Modal({ isOpen, onClose, title, children, width = 500 }) {
  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 'var(--space-4)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-base)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          width: '100%',
          maxWidth: width,
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-5)',
          }}
        >
          {title && (
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{title}</h2>
          )}
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 var(--space-1)',
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
