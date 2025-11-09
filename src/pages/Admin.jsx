// src/pages/Admin.jsx
import React, { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { getAuth, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { collection, getDocs } from 'firebase/firestore'

function AdminInner() {
  const auth = getAuth()
  const nav = useNavigate()
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [uSnap, jSnap, cSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'jobs')),
        getDocs(collection(db, 'courses')),
      ])
      setUsers(uSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setJobs(jSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setCourses(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const doSignOut = async () => {
    await signOut(auth)
    nav('/')
  }

  return (
    <div className="dashboard-wrapper fade-in">
      {/* ==== HEADER ==== */}
      <header className="dashboard-header admin-header">
        <div className="dash-brand">
          <h2>🛠️ Admin Dashboard</h2>
          <p className="muted">Manage users, monitor activity, and maintain the platform.</p>
        </div>
        <button className="btn-logout" onClick={doSignOut}>Sign Out</button>
      </header>

      {/* ==== SUMMARY ==== */}
      <section className="admin-summary">
        <div className="summary-card">
          <h3>{users.length}</h3>
          <p>Registered Users</p>
        </div>
        <div className="summary-card">
          <h3>{jobs.length}</h3>
          <p>Active Job Posts</p>
        </div>
        <div className="summary-card">
          <h3>{courses.length}</h3>
          <p>Available Courses</p>
        </div>
      </section>

      {/* ==== TABLE SECTIONS ==== */}
      {loading ? (
        <p style={{ textAlign: 'center', marginTop: 50 }}>Loading data...</p>
      ) : (
        <section className="admin-data-grid">
          <div className="dash-card">
            <h3>👥 Users</h3>
            {users.length === 0 ? (
              <p className="muted">No users found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dash-card">
            <h3>💼 Jobs</h3>
            {jobs.length === 0 ? (
              <p className="muted">No job postings yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Title</th><th>Company</th></tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id}>
                      <td>{j.title}</td>
                      <td>{j.company}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dash-card">
            <h3>🏫 Courses</h3>
            {courses.length === 0 ? (
              <p className="muted">No courses yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Title</th><th>Institution</th></tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>{c.institution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default function Admin() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminInner />
    </ProtectedRoute>
  )
}
