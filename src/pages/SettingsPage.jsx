import { useState } from 'react'
import {
  updateProfile,
  updatePassword,
  verifyBeforeUpdateEmail,
  deleteUser,
} from 'firebase/auth'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../services/firebase'
import { useAuth } from '../hooks/useAuth'
import { useUserPrefs } from '../hooks/useUserPrefs'
import AppShell from '../components/shell/AppShell'
import TopBar from '../components/shell/TopBar'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

const TABS = ['Profile', 'Account', 'Preferences', 'Data']

const LAYOUTS = [
  { value: 'compact',  label: 'Compact',  desc: 'Three-panel list view (default)' },
  { value: 'cards',    label: 'Cards',    desc: 'Card-based grid view' },
  { value: 'tactical', label: 'Tactical', desc: 'Table with sidebar' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile')

  return (
    <AppShell>
      <TopBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 200,
            flexShrink: 0,
            borderRight: '1px solid var(--color-border)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-secondary)', padding: '6px 12px', marginBottom: 'var(--space-1)' }}>
            Settings
          </div>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-base)',
                fontWeight: activeTab === tab ? 600 : 400,
                background: activeTab === tab ? 'var(--color-bg-surface)' : 'transparent',
                color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-family)',
                transition: 'background var(--transition-fast)',
              }}
            >
              {tab}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 'var(--space-6)' }}>
          {activeTab === 'Profile'     && <ProfileTab />}
          {activeTab === 'Account'     && <AccountTab />}
          {activeTab === 'Preferences' && <PreferencesTab />}
          {activeTab === 'Data'        && <DataTab />}
        </main>
      </div>
    </AppShell>
  )
}

/* ─── Profile ─────────────────────────────────────────────── */

function ProfileTab() {
  const { user, refreshUser }      = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [saving, setSaving]           = useState(false)
  const [feedback, setFeedback]       = useState(null)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)
    try {
      await updateProfile(auth.currentUser, { displayName })
      await updateDoc(doc(db, 'users', user.uid), { displayName })
      await refreshUser()
      setFeedback({ type: 'success', msg: 'Display name updated.' })
    } catch {
      setFeedback({ type: 'error', msg: 'Failed to update display name. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const initials = (user?.displayName ?? user?.email ?? '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Section title="Profile">
      {/* Avatar placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'var(--font-size-lg)', fontWeight: 700,
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{user?.displayName || '—'}</div>
          <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>{user?.email}</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Avatar upload coming in Phase 7
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: 400 }}>
        <FieldGroup label="Display name">
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
        </FieldGroup>
        <Feedback feedback={feedback} />
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Section>
  )
}

/* ─── Account ─────────────────────────────────────────────── */

function AccountTab() {
  return (
    <Section title="Account">
      <ChangeEmailForm />
      <Divider />
      <ChangePasswordForm />
      <Divider />
      <DeleteAccountSection />
    </Section>
  )
}

function ChangeEmailForm() {
  const [newEmail, setNewEmail] = useState('')
  const [busy, setBusy]         = useState(false)
  const [feedback, setFeedback] = useState(null)

  async function handle(e) {
    e.preventDefault()
    setBusy(true)
    setFeedback(null)
    try {
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail)
      setFeedback({ type: 'success', msg: `Verification email sent to ${newEmail}. Your email will update once confirmed.` })
      setNewEmail('')
    } catch (err) {
      setFeedback({ type: 'error', msg: recentLoginMsg(err.code) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h3 style={subheadStyle}>Change email</h3>
      <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
        Current: <strong style={{ color: 'var(--color-text-primary)' }}>{auth.currentUser?.email}</strong>
      </div>
      <form onSubmit={handle} style={{ maxWidth: 400 }}>
        <FieldGroup label="New email address">
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@example.com" style={inputStyle} />
        </FieldGroup>
        <Feedback feedback={feedback} />
        <Button type="submit" variant="secondary" disabled={busy}>{busy ? 'Sending…' : 'Send verification'}</Button>
      </form>
    </div>
  )
}

function ChangePasswordForm() {
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy]                       = useState(false)
  const [feedback, setFeedback]               = useState(null)

  async function handle(e) {
    e.preventDefault()
    setFeedback(null)
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', msg: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', msg: 'Password must be at least 6 characters.' })
      return
    }
    setBusy(true)
    try {
      await updatePassword(auth.currentUser, newPassword)
      setFeedback({ type: 'success', msg: 'Password updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setFeedback({ type: 'error', msg: recentLoginMsg(err.code) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h3 style={subheadStyle}>Change password</h3>
      <form onSubmit={handle} style={{ maxWidth: 400 }}>
        <FieldGroup label="New password">
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" style={inputStyle} autoComplete="new-password" />
        </FieldGroup>
        <FieldGroup label="Confirm new password">
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={inputStyle} autoComplete="new-password" />
        </FieldGroup>
        <Feedback feedback={feedback} />
        <Button type="submit" variant="secondary" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</Button>
      </form>
    </div>
  )
}

function DeleteAccountSection() {
  const { user, logout }      = useAuth()
  const navigate              = useNavigate()
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')

  async function handleDelete() {
    setBusy(true)
    setError('')
    try {
      await deleteDoc(doc(db, 'users', user.uid))
      await deleteUser(auth.currentUser)
      await logout()
      navigate('/login')
    } catch (err) {
      setError(recentLoginMsg(err.code))
      setBusy(false)
    }
  }

  return (
    <div>
      <h3 style={{ ...subheadStyle, color: '#e05a6a' }}>Delete account</h3>
      <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', maxWidth: 400 }}>
        Permanently deletes your account and profile. Your armies will also be removed.
        This cannot be undone.
      </p>
      {error && <Feedback feedback={{ type: 'error', msg: error }} />}
      <Button variant="danger" onClick={() => setConfirm(true)}>Delete my account</Button>

      <Modal isOpen={confirm} onClose={() => setConfirm(false)} title="Delete account?">
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
          This will permanently delete <strong style={{ color: 'var(--color-text-primary)' }}>{user?.email}</strong> and all your data. There is no undo.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="danger" onClick={handleDelete} disabled={busy}>
            {busy ? 'Deleting…' : 'Yes, delete everything'}
          </Button>
          <Button variant="ghost" onClick={() => setConfirm(false)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  )
}

/* ─── Preferences ─────────────────────────────────────────── */

function PreferencesTab() {
  const { prefs, updatePrefs } = useUserPrefs()
  const [feedback, setFeedback] = useState(null)

  async function handleLayoutChange(layout) {
    setFeedback(null)
    try {
      await updatePrefs({ layout })
      setFeedback({ type: 'success', msg: 'Preferences saved.' })
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message })
    }
  }

  async function handleUnitSystemChange(unitSystem) {
    setFeedback(null)
    try {
      await updatePrefs({ unitSystem })
      setFeedback({ type: 'success', msg: 'Preferences saved.' })
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message })
    }
  }

  return (
    <Section title="Preferences">
      <div style={{ maxWidth: 480 }}>
        <h3 style={subheadStyle}>Default builder layout</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          {LAYOUTS.map(opt => (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                background: prefs.layout === opt.value ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                border: `1px solid ${prefs.layout === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              <input
                type="radio"
                name="layout"
                value={opt.value}
                checked={prefs.layout === opt.value}
                onChange={() => handleLayoutChange(opt.value)}
                style={{ marginTop: 2, accentColor: 'var(--color-accent)' }}
              />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{opt.label}</div>
                <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>

        <h3 style={subheadStyle}>Unit system</h3>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          {['metric', 'imperial'].map(sys => (
            <button
              key={sys}
              onClick={() => handleUnitSystemChange(sys)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${prefs.unitSystem === sys ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: prefs.unitSystem === sys ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family)',
                fontWeight: prefs.unitSystem === sys ? 600 : 400,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              {sys}
            </button>
          ))}
        </div>

        <Feedback feedback={feedback} />
      </div>
    </Section>
  )
}

/* ─── Data ────────────────────────────────────────────────── */

function DataTab() {
  const { clearCache }          = useUserPrefs()
  const [feedback, setFeedback] = useState(null)

  function handleClearCache() {
    clearCache()
    setFeedback({ type: 'success', msg: 'Local cache cleared. Preferences reset to defaults.' })
  }

  return (
    <Section title="Data">
      <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div>
          <h3 style={subheadStyle}>Export my data</h3>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            Download a JSON file of all your armies and preferences.
          </p>
          <Button variant="secondary" disabled>
            Export data — available in Phase 6
          </Button>
        </div>

        <div>
          <h3 style={subheadStyle}>Clear local cache</h3>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            Removes locally cached preferences. Your data in Firebase is not affected.
          </p>
          <Feedback feedback={feedback} />
          <Button variant="secondary" onClick={handleClearCache}>
            Clear cache
          </Button>
        </div>
      </div>
    </Section>
  )
}

/* ─── Shared primitives ───────────────────────────────────── */

function Section({ title, children }) {
  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <label style={{ display: 'block', fontSize: 'var(--font-size-base)', fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Feedback({ feedback }) {
  if (!feedback) return null
  const isSuccess = feedback.type === 'success'
  return (
    <div style={{
      padding: '10px 14px',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--font-size-base)',
      marginBottom: 'var(--space-3)',
      background: isSuccess ? '#1a3d28' : '#4a1520',
      border: `1px solid ${isSuccess ? '#2a6040' : 'var(--color-accent)'}`,
      color: isSuccess ? '#6ee7a0' : '#f5a0a8',
    }}>
      {feedback.msg}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--color-border)', margin: 'var(--space-5) 0' }} />
}

function recentLoginMsg(code) {
  if (code === 'auth/requires-recent-login') {
    return 'For security, sign out and sign back in before making this change.'
  }
  return 'Something went wrong. Please try again.'
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  fontSize: 'var(--font-size-md)',
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family)',
  outline: 'none',
}

const subheadStyle = {
  fontSize: 'var(--font-size-md)',
  fontWeight: 700,
  marginBottom: 'var(--space-3)',
}
