// frontend/src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const auth = getAuth()
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false)
        setLoading(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (!snap.exists()) {
          setAllowed(false)
        } else {
          const role = snap.data().role
          setUserRole(role)
          setAllowed(allowedRoles.includes(role))
        }
      } catch (err) {
        console.error('ProtectedRoute error:', err)
        setAllowed(false)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [allowedRoles])

  // === LOADING SCREEN ===
  if (loading) {
    return (
      <div className="protected-wrapper fade-in">
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Verifying access...</p>
        </div>
      </div>
    )
  }

  // === ACCESS DENIED ===
  if (!allowed) {
    return (
      <div className="protected-wrapper fade-in">
        <div className="access-denied-card">
          <h2>🚫 Access Denied</h2>
          <p>Your account ({userRole || 'guest'}) does not have permission to access this page.</p>
          <a href="/" className="btn-primary">Return Home</a>
        </div>
      </div>
    )
  }

  // === ALLOWED ===
  return children
}
