import { NavLink, Outlet } from 'react-router-dom'
import AppShell from '../../components/shell/AppShell'
import TopBar from '../../components/shell/TopBar'
import RequireAdmin from '../../components/admin/RequireAdmin'

const NAV = [
  { to: '/admin',          label: 'Units Table', end: true },
  { to: '/admin/import',   label: 'Import'                },
  { to: '/admin/unit/new', label: 'New Unit'              },
  { to: '/admin/systems',  label: 'Systems'               },
]

export default function AdminPage() {
  return (
    <AppShell>
      <TopBar />
      <RequireAdmin>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar */}
          <nav style={{
            width: 180,
            flexShrink: 0,
            background: 'var(--color-bg-base)',
            borderRight: '1px solid var(--color-border)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-2)' }}>
              Admin
            </div>
            {NAV.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                style={({ isActive }) => ({
                  padding: '7px 10px',
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

          {/* Main content */}
          <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg-base)' }}>
            <Outlet />
          </div>
        </div>
      </RequireAdmin>
    </AppShell>
  )
}
