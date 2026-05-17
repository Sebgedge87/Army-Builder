import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

const NAV_LINKS = [
  { to: '/armies',   label: 'My Armies' },
  { to: '/builder',  label: 'Builder'   },
  { to: '/settings', label: 'Settings'  },
]

export default function TopBar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div
      style={{
        height: 52,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-5)',
        background: 'var(--color-bg-base)',
        borderBottom: '1px solid var(--color-border)',
        gap: 'var(--space-4)',
      }}
    >
      {/* Logo */}
      <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, letterSpacing: '-0.5px', flexShrink: 0 }}>
        ⚔ CFB
      </span>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: 'var(--space-1)', flex: 1 }}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              textDecoration: 'none',
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              background: isActive ? 'var(--color-bg-surface)' : 'transparent',
              transition: 'background var(--transition-fast), color var(--transition-fast)',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
        {user?.displayName && (
          <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>
            {user.displayName}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
