import React, { useEffect, useState } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { useNavigate, Link } from 'react-router-dom'
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
    nav('/login')
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
    <>
      {/* NAVBAR / HEADER */}
      <nav className="navbar">
        <div className="logo">Career<span>Connect</span></div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/">Home</Link>
          <button className="btn-logout" onClick={doSignOut}>Sign Out</button>
        </div>
      </nav>

      <div className="dashboard-wrapper fade-in" style={{ paddingTop: '120px' }}>
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

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-columns">
          <div>
            <h3>Career<span>Connect</span></h3>
            <p>Empowering growth through education and employment integration.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <p>Email: support@careerconnect.com</p>
            <p>Phone: +266 555 12345</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CareerConnect. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
