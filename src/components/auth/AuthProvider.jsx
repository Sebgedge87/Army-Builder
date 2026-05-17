import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../services/firebase'
import { AuthContext } from '../../hooks/useAuth'

const DEFAULT_PREFS = { layout: 'compact' }

export default function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        setUser({
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          displayName: firebaseUser.displayName,
          isAdmin:     snap.exists() ? (snap.data().isAdmin ?? false) : false,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signup(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email,
      displayName,
      isAdmin:   false,
      createdAt: serverTimestamp(),
      prefs:     DEFAULT_PREFS,
    })
  }

  async function loginWithGoogle() {
    const cred    = await signInWithPopup(auth, new GoogleAuthProvider())
    const userRef = doc(db, 'users', cred.user.uid)
    const snap    = await getDoc(userRef)
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid:         cred.user.uid,
        email:       cred.user.email,
        displayName: cred.user.displayName,
        isAdmin:     false,
        createdAt:   serverTimestamp(),
        prefs:       DEFAULT_PREFS,
      })
    }
  }

  async function logout() {
    await signOut(auth)
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email)
  }

  async function refreshUser() {
    if (!auth.currentUser) return
    const snap = await getDoc(doc(db, 'users', auth.currentUser.uid))
    setUser({
      uid:         auth.currentUser.uid,
      email:       auth.currentUser.email,
      displayName: auth.currentUser.displayName,
      isAdmin:     snap.exists() ? (snap.data().isAdmin ?? false) : false,
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, resetPassword, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
