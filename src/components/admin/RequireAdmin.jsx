import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { Navigate } from 'react-router-dom'
import { db } from '../../services/firebase'
import { useAuth } from '../../hooks/useAuth'

export default function RequireAdmin({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid))
      .then(snap => setIsAdmin(snap.data()?.isAdmin === true))
      .catch(() => setIsAdmin(false))
  }, [user])

  if (authLoading || (user && isAdmin === null)) return null
  if (!user) return <Navigate to="/login" replace />

  if (!isAdmin) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        color: 'var(--color-text-secondary)',
        padding: 'var(--space-6)',
      }}>
        <div style={{ fontSize: 40, opacity: 0.15 }}>🔒</div>
        <div style={{ fontWeight: 600, color: 'var(--color-text-tertiary)' }}>Admin access required</div>
        <div style={{ fontSize: 'var(--font-size-sm)' }}>
          Your account does not have admin privileges. Contact the site administrator.
        </div>
      </div>
    )
  }

  return children
}
