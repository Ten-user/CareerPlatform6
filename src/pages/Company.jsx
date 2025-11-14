// src/pages/Company.jsx
// FULL COMPANY MODULE (Firestore logic will be added later)
// - Post jobs with requirements
// - View qualified applicants (placeholder logic)
// - Update company profile
// - Clean, production-ready UI structure

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { getAuth, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'

function CompanyInner() {
  const auth = getAuth()
  const nav = useNavigate()

  // JOB POST STATES
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [requirements, setRequirements] = useState('')
  const [qualifications, setQualifications] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)

  // PROFILE STATES
  const [profile, setProfile] = useState({ name: '', about: '', website: '' })

  const doSignOut = async () => {
    await signOut(auth)
    nav('/')
  }

  // ==== ADD JOB (Firestore plug-in later) ====
  const addJob = async (e) => {
    e.preventDefault()
    if (!title || !desc) return alert('Please fill all fields.')
    try {
      setLoading(true)
      // Placeholder Firestore call
      await addDoc(collection(db, 'jobs'), {
        title,
        description: desc,
        requirements,
        qualifications,
        createdAt: serverTimestamp(),
        company: auth.currentUser?.email || 'Unknown',
      })

      setTitle('')
      setDesc('')
      setRequirements('')
      setQualifications('')
      await loadJobs()
      alert('Job posted successfully!')
    } catch (err) {
      console.error(err)
      alert('Failed to post job: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ==== LOAD JOBS (Firestore plug-in later) ====
  const loadJobs = async () => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { loadJobs() }, [])

  // ==== QUALIFIED APPLICANTS PLACEHOLDER ====
  const QualifiedApplicantsSection = () => (
    <div className="dash-card">
      <h3>🎯 Qualified Applicants</h3>
      <p className="muted">
        This section will automatically display applicants filtered by:
      </p>
      <ul>
        <li>Academic Performance</li>
        <li>Extra Certificates</li>
        <li>Work Experience</li>
        <li>Relevance to Job Post</li>
      </ul>
      <p className="muted">(Logic will be fully applied once Firestore is connected.)</p>
    </div>
  )

  // ==== UPDATE PROFILE PLACEHOLDER ====
  const updateProfile = (e) => {
    e.preventDefault()
    alert('Profile update will sync once Firestore is ready.')
  }

  return (
    <div className="dashboard-wrapper fade-in">
      {/* HEADER */}
      <header className="dashboard-header company-header">
        <div className="dash-brand">
          <h2>💼 Company Dashboard</h2>
          <p className="muted">Manage your jobs, profile, and applicants.</p>
        </div>
        <button className="btn-logout" onClick={doSignOut}>Sign Out</button>
      </header>

      {/* ==== POST JOB ==== */}
      <section className="upload-section card">
        <h3>➕ Post a New Job</h3>
        <form onSubmit={addJob}>
          <input placeholder="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <textarea
            placeholder="Job Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows="3"
            required
          />

          <textarea
            placeholder="Required Qualifications"
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            rows="2"
          />

          <textarea
            placeholder="Job Requirements (skills, experience, etc.)"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows="3"
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
            <p className="muted">No jobs yet.</p>
          ) : (
            <ul>
              {jobs.map((j) => (
                <li key={j.id} className="job-item">
                  <strong>{j.title}</strong>
                  <p className="muted">{j.description}</p>
                  {j.qualifications && <p><strong>Qualifications:</strong> {j.qualifications}</p>}
                  {j.requirements && <p><strong>Requirements:</strong> {j.requirements}</p>}
                  <p className="muted small">Posted By: {j.company}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* QUALIFIED APPLICANTS */}
        <QualifiedApplicantsSection />
      </section>

      {/* ==== PROFILE UPDATE ==== */}
      <section className="card">
        <h3>🏢 Update Company Profile</h3>
        <form onSubmit={updateProfile}>
          <input
            placeholder="Company Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
          <textarea
            placeholder="About Your Company"
            value={profile.about}
            onChange={(e) => setProfile({ ...profile, about: e.target.value })}
            rows="3"
          />
          <input
            placeholder="Website URL"
            value={profile.website}
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
          />
          <button className="btn-primary full-width">Save Changes</button>
        </form>
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
