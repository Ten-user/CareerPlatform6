// src/pages/Institute.jsx
import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { getAuth, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'

function InstituteInner() {
  const auth = getAuth()
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [desc, setDesc] = useState('')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  const doSignOut = async () => {
    await signOut(auth)
    nav('/')
  }

  const addCourse = async (e) => {
    e.preventDefault()
    if (!title || !duration || !desc) return alert('Please fill all fields.')
    try {
      setLoading(true)
      await addDoc(collection(db, 'courses'), {
        title,
        duration,
        description: desc,
        createdAt: serverTimestamp(),
        institution: auth.currentUser?.email || 'Unknown',
      })
      setTitle('')
      setDuration('')
      setDesc('')
      await loadCourses()
      alert('Course added successfully!')
    } catch (err) {
      console.error(err)
      alert('Failed to add course: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { loadCourses() }, [])

  return (
    <div className="dashboard-wrapper fade-in">
      {/* ==== HEADER ==== */}
      <header className="dashboard-header">
        <div className="dash-brand">
          <h2>🏫 Institute Dashboard</h2>
          <p className="muted">Manage your courses and programs efficiently</p>
        </div>
        <button className="btn-logout" onClick={doSignOut}>Sign Out</button>
      </header>

      {/* ==== ADD COURSE ==== */}
      <section className="upload-section card">
        <h3>➕ Add a New Course</h3>
        <p className="muted">Fill in the details below to add a new course to your institution.</p>
        <form onSubmit={addCourse}>
          <input
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            placeholder="Duration (e.g., 3 years)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <textarea
            placeholder="Course Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows="4"
            required
          />
          <button className="btn-primary full-width" type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Course'}
          </button>
        </form>
      </section>

      {/* ==== ALL COURSES ==== */}
      <section className="dash-grid">
        <div className="dash-card">
          <h3>📚 All Courses</h3>
          {courses.length === 0 ? (
            <p className="muted">No courses have been added yet.</p>
          ) : (
            <ul>
              {courses.map((c) => (
                <li key={c.id}>
                  <strong>{c.title}</strong> — {c.duration}
                  <p className="muted">{c.description}</p>
                  <p className="muted" style={{ fontSize: '13px' }}>
                    Added by: <em>{c.institution}</em>
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

export default function Institute() {
  return (
    <ProtectedRoute allowedRoles={['institute']}>
      <InstituteInner />
    </ProtectedRoute>
  )
}
