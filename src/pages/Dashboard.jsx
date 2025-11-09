// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { db, storage } from '../services/firebase'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function Dashboard() {
  const auth = getAuth()
  const nav = useNavigate()
  const [courses, setCourses] = useState([])
  const [jobs, setJobs] = useState([])
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const doSignOut = async () => {
    await signOut(auth)
    nav('/')
  }

  const loadData = async () => {
    const cSnap = await getDocs(collection(db, 'courses'))
    const jSnap = await getDocs(collection(db, 'jobs'))
    setCourses(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setJobs(jSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { loadData() }, [])

  const onFileChange = (e) => setFile(e.target.files[0] || null)

  const uploadTranscript = async (e) => {
    e.preventDefault()
    if (!file) return alert('Please choose a file first')
    try {
      setUploading(true)
      const uid = auth.currentUser?.uid || 'anonymous'
      const storageRef = ref(storage, `transcripts/${uid}/${Date.now()}_${file.name}`)
      const snap = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snap.ref)
      await addDoc(collection(db, 'transcripts'), {
        uid,
        name: file.name,
        size: file.size,
        contentType: file.type,
        url,
        createdAt: serverTimestamp(),
      })
      setFile(null)
      alert('Transcript uploaded successfully!')
    } catch (err) {
      console.error(err)
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="dashboard-wrapper fade-in">
      {/* ==== HEADER ==== */}
      <header className="dashboard-header">
        <div className="dash-brand">
          <h2>🎓 Student Dashboard</h2>
          <p className="muted">Welcome back, {auth.currentUser?.email}</p>
        </div>
        <button className="btn-logout" onClick={doSignOut}>
          Sign Out
        </button>
      </header>

      {/* ==== UPLOAD TRANSCRIPT ==== */}
      <section className="upload-section card">
        <h3>📁 Upload Transcript</h3>
        <p className="muted">Accepted formats: PDF, DOC, DOCX, JPG, PNG</p>
        <form onSubmit={uploadTranscript}>
          <input type="file" onChange={onFileChange} accept=".pdf,.doc,.docx,.jpg,.png" />
          <button className="btn-primary full-width" type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Transcript'}
          </button>
        </form>
      </section>

      {/* ==== COURSES AND JOBS ==== */}
      <section className="dash-grid">
        <div className="dash-card">
          <h3>🎓 Available Courses</h3>
          {courses.length === 0 && <p className="muted">No courses yet.</p>}
          <ul>
            {courses.map((c) => (
              <li key={c.id}>
                <strong>{c.title}</strong> — {c.duration}
                <p className="muted">{c.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="dash-card">
          <h3>💼 Available Jobs</h3>
          {jobs.length === 0 && <p className="muted">No jobs yet.</p>}
          <ul>
            {jobs.map((j) => (
              <li key={j.id}>
                <strong>{j.title}</strong>
                <p className="muted">{j.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
