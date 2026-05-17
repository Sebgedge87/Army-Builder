const variantStyles = {
  primary:   { background: 'var(--color-accent)',   color: 'var(--color-text-primary)', border: 'none' },
  secondary: { background: 'var(--color-bg-hover)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' },
  ghost:     { background: 'transparent',           color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' },
  danger:    { background: '#7a1e2b',               color: 'var(--color-text-primary)', border: 'none' },
}

const sizeStyles = {
  sm: { padding: '4px 8px',   fontSize: 'var(--font-size-sm)' },
  md: { padding: '8px 14px',  fontSize: 'var(--font-size-base)' },
  lg: { padding: '11px 20px', fontSize: 'var(--font-size-md)' },
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  style,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-1)',
        fontFamily: 'var(--font-family)',
        fontWeight: 600,
        borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--transition-fast)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </button>
  )
}
