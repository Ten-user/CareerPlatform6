// src/pages/Company.jsx
import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { getAuth, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'

function CompanyInner() {
  const auth = getAuth()
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)

  const doSignOut = async () => {
    await signOut(auth)
    nav('/')
  }

  const addJob = async (e) => {
    e.preventDefault()
    if (!title || !desc) return alert('Please fill all fields.')
    try {
      setLoading(true)
      await addDoc(collection(db, 'jobs'), {
        title,
        description: desc,
        createdAt: serverTimestamp(),
        company: auth.currentUser?.email || 'Unknown',
      })
      setTitle('')
      setDesc('')
      await loadJobs()
      alert('Job posted successfully!')
    } catch (err) {
      console.error(err)
      alert('Failed to post job: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadJobs = async () => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { loadJobs() }, [])

  return (
    <div className="dashboard-wrapper fade-in">
      {/* ==== HEADER ==== */}
      <header className="dashboard-header company-header">
        <div className="dash-brand">
          <h2>💼 Company Dashboard</h2>
          <p className="muted">Post jobs and connect with top talent from verified institutions.</p>
        </div>
        <button className="btn-logout" onClick={doSignOut}>Sign Out</button>
      </header>

      {/* ==== ADD JOB SECTION ==== */}
      <section className="upload-section card">
        <h3>➕ Post a New Job</h3>
        <p className="muted">Describe the role, and it’ll appear instantly for all students and institutions.</p>
        <form onSubmit={addJob}>
          <input
            placeholder="Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Job Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows="4"
            required
          />
          <button className="btn-primary full-width" type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </section>

      {/* ==== JOB LIST ==== */}
      <section className="dash-grid">
        <div className="dash-card">
          <h3>📋 All Posted Jobs</h3>
          {jobs.length === 0 ? (
            <p className="muted">No job postings yet. Start by adding one above!</p>
          ) : (
            <ul>
              {jobs.map((j) => (
                <li key={j.id}>
                  <strong>{j.title}</strong>
                  <p className="muted">{j.description}</p>
                  <p className="muted" style={{ fontSize: '13px' }}>
                    Posted by: <em>{j.company}</em>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

export default function Company() {
  return (
    <ProtectedRoute allowedRoles={['company']}>
      <CompanyInner />
    </ProtectedRoute>
  )
}
