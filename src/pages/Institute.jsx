// Institute Module (Full Single-Page Dashboard)
// Firestore integration will be added later

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { getAuth, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

export default function Institute() {
  return (
    <ProtectedRoute allowedRoles={['institute']}>
      <InstituteInner />
    </ProtectedRoute>
  )
}

function InstituteInner() {
  const auth = getAuth()
  const nav = useNavigate()

  // ====== STATES ======
  const [faculties, setFaculties] = useState([])
  const [courses, setCourses] = useState([])
  const [applications, setApplications] = useState([])
  const [admissions, setAdmissions] = useState([])

  const [facultyName, setFacultyName] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [courseDuration, setCourseDuration] = useState('')
  const [courseDesc, setCourseDesc] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')

  const [profile, setProfile] = useState({ name: '', about: '' })

  const [loading, setLoading] = useState(false)

  // ====== SIGN OUT ======
  const doSignOut = async () => {
    await signOut(auth)
    nav('/')
  }

  // ====== FAKE LOADERS (FIRESTORE LATER) ======
  const loadAll = () => {
    setFaculties([])
    setCourses([])
    setApplications([])
    setAdmissions([])
  }

  useEffect(() => { loadAll() }, [])

  // ====== ADD FACULTY ======
  const addFaculty = (e) => {
    e.preventDefault()
    if (!facultyName) return alert('Enter faculty name')

    setFaculties((prev) => [...prev, { id: Date.now(), name: facultyName }])
    setFacultyName('')
    alert('Faculty added (Firestore coming soon)')
  }

  // ====== ADD COURSE ======
  const addCourse = (e) => {
    e.preventDefault()
    if (!courseTitle || !courseDuration || !courseDesc || !selectedFaculty)
      return alert('Fill all course fields')

    setCourses((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: courseTitle,
        duration: courseDuration,
        description: courseDesc,
        faculty: selectedFaculty
      }
    ])

    setCourseTitle('')
    setCourseDuration('')
    setCourseDesc('')
    setSelectedFaculty('')
    alert('Course added (Firestore coming soon)')
  }

  // ====== UPDATE PROFILE ======
  const updateProfile = (e) => {
    e.preventDefault()
    alert('Profile updated (Firestore coming soon)')
  }

  return (
    <div className="dashboard-wrapper fade-in" style={{ paddingTop: '120px' }}>
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="dash-brand">
          <h2>🏫 Institute Dashboard</h2>
          <p className="muted">Manage faculties, courses, admissions & profile</p>
        </div>
        <button className="btn-logout" onClick={doSignOut}>Sign Out</button>
      </header>

      {/* ===================== FACULTIES ===================== */}
      <section className="upload-section card">
        <h3>➕ Add Faculty</h3>
        <form onSubmit={addFaculty}>
          <input value={facultyName} onChange={(e) => setFacultyName(e.target.value)} placeholder="Faculty Name" required />
          <button className="btn-primary full-width" type="submit">Add Faculty</button>
        </form>
      </section>

      <section className="dash-grid">
        <div className="dash-card">
          <h3>🏛️ Faculties</h3>
          {faculties.length === 0 ? <p className="muted">No faculties added yet.</p> : (
            <ul>
              {faculties.map((f) => (
                <li key={f.id}><strong>{f.name}</strong></li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ===================== COURSES ===================== */}
      <section className="upload-section card">
        <h3>📚 Add Course</h3>
        <form onSubmit={addCourse}>

          <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} required>
            <option value="">Select Faculty</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>

          <input value={courseTitle} placeholder="Course Title" onChange={(e) => setCourseTitle(e.target.value)} required />
          <input value={courseDuration} placeholder="Duration (e.g. 4 years)" onChange={(e) => setCourseDuration(e.target.value)} required />
          <textarea value={courseDesc} placeholder="Course Description" onChange={(e) => setCourseDesc(e.target.value)} rows="4" required />

          <button className="btn-primary full-width" type="submit">Add Course</button>
        </form>
      </section>

      <section className="dash-grid">
        <div className="dash-card">
          <h3>📖 Courses</h3>
          {courses.length === 0 ? <p className="muted">No courses added yet.</p> : (
            <ul>
              {courses.map((c) => (
                <li key={c.id}>
                  <strong>{c.title}</strong> — {c.duration}
                  <p className="muted">Faculty: {c.faculty}</p>
                  <p className="muted">{c.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ===================== APPLICATIONS ===================== */}
      <section className="dash-grid">
        <div className="dash-card">
          <h3>📝 Student Applications</h3>
          <p className="muted">(Data will load from Firestore later)</p>
        </div>
      </section>

      {/* ===================== ADMISSIONS ===================== */}
      <section className="dash-grid">
        <div className="dash-card">
          <h3>🎓 Admissions</h3>
          <p className="muted">Publish admission results once applications are evaluated.</p>
        </div>
      </section>

      {/* ===================== PROFILE ===================== */}
      <section className="upload-section card">
        <h3>🏢 Institution Profile</h3>

        <form onSubmit={updateProfile}>
          <input value={profile.name} placeholder="Institution Name" onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <textarea value={profile.about} placeholder="About Institution" rows="4" onChange={(e) => setProfile({ ...profile, about: e.target.value })} />
          <button className="btn-primary full-width">Update Profile</button>
        </form>
      </section>
    </div>
  )
}
