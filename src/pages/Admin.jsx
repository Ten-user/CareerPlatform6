import React, { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { getAuth, signOut } from 'firebase/auth'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../services/firebase'
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

// Single-file Admin page with CRUD for institutions, faculties, courses, companies,
// admissions and simple reports. Firestore collections are used in a flat layout
// (institutions, faculties, courses, companies, admissions, applications).

function AdminInner() {
  const auth = getAuth()
  const nav = useNavigate()

  // master lists
  const [users, setUsers] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [faculties, setFaculties] = useState([])
  const [courses, setCourses] = useState([])
  const [companies, setCompanies] = useState([])
  const [admissions, setAdmissions] = useState([])
  const [applications, setApplications] = useState([])

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // UI states for forms & editing
  const [activeSection, setActiveSection] = useState('summary')

  const [instForm, setInstForm] = useState({ id: null, name: '' })
  const [facForm, setFacForm] = useState({ id: null, name: '', institutionId: '' })
  const [courseForm, setCourseForm] = useState({ id: null, title: '', facultyId: '' })
  const [companyActionLoading, setCompanyActionLoading] = useState(false)

  // --- Data loading ---
  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [uSnap, iSnap, fSnap, cSnap, coSnap, aSnap, appSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'institutions')),
        getDocs(collection(db, 'faculties')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'companies')),
        getDocs(collection(db, 'admissions')),
        getDocs(collection(db, 'applications')),
      ])

      setUsers(uSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setInstitutions(iSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setFaculties(fSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setCourses(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setCompanies(coSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setAdmissions(aSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setApplications(appSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Admin load error', err)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const doSignOut = async () => {
    await signOut(auth)
    nav('/login')
  }

  // --- Institutions CRUD ---
  const createOrUpdateInstitution = async (e) => {
    e.preventDefault()
    if (!instForm.name.trim()) return
    setBusy(true)
    try {
      if (instForm.id) {
        const ref = doc(db, 'institutions', instForm.id)
        await updateDoc(ref, { name: instForm.name.trim(), updatedAt: serverTimestamp() })
      } else {
        await addDoc(collection(db, 'institutions'), {
          name: instForm.name.trim(),
          createdAt: serverTimestamp(),
        })
      }
      setInstForm({ id: null, name: '' })
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to save institution')
    } finally {
      setBusy(false)
    }
  }

  const editInstitution = (inst) => {
    setInstForm({ id: inst.id, name: inst.name || '' })
    setActiveSection('institutions')
  }

  const deleteInstitution = async (id) => {
    if (!confirm('Delete this institution? This will not remove linked faculties/courses automatically.')) return
    setBusy(true)
    try {
      await deleteDoc(doc(db, 'institutions', id))
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to delete institution')
    } finally {
      setBusy(false)
    }
  }

  // --- Faculties CRUD ---
  const createOrUpdateFaculty = async (e) => {
    e.preventDefault()
    if (!facForm.name.trim() || !facForm.institutionId) return
    setBusy(true)
    try {
      if (facForm.id) {
        await updateDoc(doc(db, 'faculties', facForm.id), {
          name: facForm.name.trim(),
          institutionId: facForm.institutionId,
          updatedAt: serverTimestamp(),
        })
      } else {
        await addDoc(collection(db, 'faculties'), {
          name: facForm.name.trim(),
          institutionId: facForm.institutionId,
          createdAt: serverTimestamp(),
        })
      }
      setFacForm({ id: null, name: '', institutionId: '' })
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to save faculty')
    } finally {
      setBusy(false)
    }
  }

  const editFaculty = (f) => {
    setFacForm({ id: f.id, name: f.name || '', institutionId: f.institutionId || '' })
    setActiveSection('faculties')
  }

  const deleteFaculty = async (id) => {
    if (!confirm('Delete this faculty? This will not remove linked courses automatically.')) return
    setBusy(true)
    try {
      await deleteDoc(doc(db, 'faculties', id))
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to delete faculty')
    } finally {
      setBusy(false)
    }
  }

  // --- Courses CRUD ---
  const createOrUpdateCourse = async (e) => {
    e.preventDefault()
    if (!courseForm.title.trim() || !courseForm.facultyId) return
    setBusy(true)
    try {
      if (courseForm.id) {
        await updateDoc(doc(db, 'courses', courseForm.id), {
          title: courseForm.title.trim(),
          facultyId: courseForm.facultyId,
          updatedAt: serverTimestamp(),
        })
      } else {
        await addDoc(collection(db, 'courses'), {
          title: courseForm.title.trim(),
          facultyId: courseForm.facultyId,
          createdAt: serverTimestamp(),
        })
      }
      setCourseForm({ id: null, title: '', facultyId: '' })
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to save course')
    } finally {
      setBusy(false)
    }
  }

  const editCourse = (c) => {
    setCourseForm({ id: c.id, title: c.title || '', facultyId: c.facultyId || '' })
    setActiveSection('courses')
  }

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return
    setBusy(true)
    try {
      await deleteDoc(doc(db, 'courses', id))
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to delete course')
    } finally {
      setBusy(false)
    }
  }

  // --- Company management ---
  const setCompanyStatus = async (companyId, status) => {
    if (!confirm(`Set company status to ${status}?`)) return
    setCompanyActionLoading(true)
    try {
      await updateDoc(doc(db, 'companies', companyId), { status, updatedAt: serverTimestamp() })
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to update company')
    } finally {
      setCompanyActionLoading(false)
    }
  }

  const deleteCompany = async (companyId) => {
    if (!confirm('Delete this company?')) return
    setCompanyActionLoading(true)
    try {
      await deleteDoc(doc(db, 'companies', companyId))
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to delete company')
    } finally {
      setCompanyActionLoading(false)
    }
  }

  // --- Admissions publishing & applications ---
  const publishAdmission = async (ad) => {
    if (!ad || !ad.title) return
    if (!confirm(`Publish admission: ${ad.title}?`)) return
    setBusy(true)
    try {
      if (ad.id) {
        await updateDoc(doc(db, 'admissions', ad.id), { published: true, publishedAt: serverTimestamp() })
      }
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to publish admission')
    } finally {
      setBusy(false)
    }
  }

  const closeAdmission = async (id) => {
    if (!confirm('Close this admission?')) return
    setBusy(true)
    try {
      await updateDoc(doc(db, 'admissions', id), { published: false, closedAt: serverTimestamp() })
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to close admission')
    } finally {
      setBusy(false)
    }
  }

  // Approve / reject application
  const setApplicationStatus = async (appId, status) => {
    if (!confirm(`Set application ${appId} to ${status}?`)) return
    setBusy(true)
    try {
      await updateDoc(doc(db, 'applications', appId), { status, updatedAt: serverTimestamp() })
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to update application')
    } finally {
      setBusy(false)
    }
  }

  // --- Reports (simple client-side summaries) ---
  const reports = {
    totalUsers: users.length,
    totalInstitutions: institutions.length,
    totalFaculties: faculties.length,
    totalCourses: courses.length,
    totalCompanies: companies.length,
    publishedAdmissions: admissions.filter((a) => a.published).length,
    totalApplications: applications.length,
  }

  // --- helpers ---
  const facultiesByInstitution = (institutionId) => faculties.filter((f) => f.institutionId === institutionId)
  const coursesByFaculty = (facultyId) => courses.filter((c) => c.facultyId === facultyId)

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">Career<span>Connect</span></div>
        <div className="nav-links">
          <Link to="/admin">Admin</Link>
          <Link to="/">Home</Link>
          <button className="btn-logout" onClick={doSignOut}>Sign Out</button>
        </div>
      </nav>

      <div className="dashboard-wrapper fade-in" style={{ paddingTop: '100px' }}>
        <header className="dashboard-header admin-header">
          <div className="dash-brand">
            <h2>🛠️ Admin Dashboard</h2>
            <p className="muted">Manage institutions, faculties, courses, companies, admissions and users.</p>
          </div>

          <div className="dash-actions">
            <button onClick={() => { setActiveSection('summary') }}>Summary</button>
            <button onClick={() => { setActiveSection('institutions') }}>Institutions</button>
            <button onClick={() => { setActiveSection('faculties') }}>Faculties</button>
            <button onClick={() => { setActiveSection('courses') }}>Courses</button>
            <button onClick={() => { setActiveSection('companies') }}>Companies</button>
            <button onClick={() => { setActiveSection('admissions') }}>Admissions</button>
            <button onClick={() => { setActiveSection('reports') }}>Reports</button>
          </div>
        </header>

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: 30 }}>Loading admin data...</p>
        ) : (
          <main>
            {/* SUMMARY */}
            {activeSection === 'summary' && (
              <section className="admin-summary grid-3">
                <div className="summary-card">
                  <h3>{reports.totalUsers}</h3>
                  <p>Registered Users</p>
                </div>
                <div className="summary-card">
                  <h3>{reports.totalInstitutions}</h3>
                  <p>Institutions</p>
                </div>
                <div className="summary-card">
                  <h3>{reports.totalFaculties}</h3>
                  <p>Faculties</p>
                </div>
                <div className="summary-card">
                  <h3>{reports.totalCourses}</h3>
                  <p>Courses</p>
                </div>
                <div className="summary-card">
                  <h3>{reports.totalCompanies}</h3>
                  <p>Companies</p>
                </div>
                <div className="summary-card">
                  <h3>{reports.publishedAdmissions}</h3>
                  <p>Published Admissions</p>
                </div>
              </section>
            )}

            {/* INSTITUTIONS */}
            {activeSection === 'institutions' && (
              <section className="admin-section">
                <h3>Institutions</h3>
                <form onSubmit={createOrUpdateInstitution} className="simple-form">
                  <input
                    placeholder="Institution name"
                    value={instForm.name}
                    onChange={(e) => setInstForm((s) => ({ ...s, name: e.target.value }))}
                  />
                  <button type="submit" disabled={busy}>{instForm.id ? 'Update' : 'Create'}</button>
                  {instForm.id && <button type="button" onClick={() => setInstForm({ id: null, name: '' })}>Cancel</button>}
                </form>

                <div className="list-card">
                  {institutions.length === 0 ? (
                    <p className="muted">No institutions yet.</p>
                  ) : (
                    <table className="admin-table">
                      <thead><tr><th>Name</th><th>Actions</th></tr></thead>
                      <tbody>
                        {institutions.map((inst) => (
                          <tr key={inst.id}>
                            <td>{inst.name}</td>
                            <td>
                              <button onClick={() => editInstitution(inst)}>Edit</button>
                              <button onClick={() => deleteInstitution(inst.id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            )}

            {/* FACULTIES */}
            {activeSection === 'faculties' && (
              <section className="admin-section">
                <h3>Faculties</h3>
                <form onSubmit={createOrUpdateFaculty} className="simple-form">
                  <select value={facForm.institutionId} onChange={(e) => setFacForm((s) => ({ ...s, institutionId: e.target.value }))}>
                    <option value="">Select Institution</option>
                    {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                  <input placeholder="Faculty name" value={facForm.name} onChange={(e) => setFacForm((s) => ({ ...s, name: e.target.value }))} />
                  <button type="submit" disabled={busy}>{facForm.id ? 'Update' : 'Create'}</button>
                  {facForm.id && <button type="button" onClick={() => setFacForm({ id: null, name: '', institutionId: '' })}>Cancel</button>}
                </form>

                <div className="list-card">
                  {faculties.length === 0 ? (
                    <p className="muted">No faculties yet.</p>
                  ) : (
                    <table className="admin-table">
                      <thead><tr><th>Name</th><th>Institution</th><th>Actions</th></tr></thead>
                      <tbody>
                        {faculties.map((f) => {
                          const inst = institutions.find((i) => i.id === f.institutionId)
                          return (
                            <tr key={f.id}>
                              <td>{f.name}</td>
                              <td>{inst ? inst.name : '—'}</td>
                              <td>
                                <button onClick={() => editFaculty(f)}>Edit</button>
                                <button onClick={() => deleteFaculty(f.id)}>Delete</button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            )}

            {/* COURSES */}
            {activeSection === 'courses' && (
              <section className="admin-section">
                <h3>Courses</h3>
                <form onSubmit={createOrUpdateCourse} className="simple-form">
                  <select value={courseForm.facultyId} onChange={(e) => setCourseForm((s) => ({ ...s, facultyId: e.target.value }))}>
                    <option value="">Select Faculty</option>
                    {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <input placeholder="Course title" value={courseForm.title} onChange={(e) => setCourseForm((s) => ({ ...s, title: e.target.value }))} />
                  <button type="submit" disabled={busy}>{courseForm.id ? 'Update' : 'Create'}</button>
                  {courseForm.id && <button type="button" onClick={() => setCourseForm({ id: null, title: '', facultyId: '' })}>Cancel</button>}
                </form>

                <div className="list-card">
                  {courses.length === 0 ? (
                    <p className="muted">No courses yet.</p>
                  ) : (
                    <table className="admin-table">
                      <thead><tr><th>Title</th><th>Faculty</th><th>Actions</th></tr></thead>
                      <tbody>
                        {courses.map((c) => {
                          const f = faculties.find((x) => x.id === c.facultyId)
                          return (
                            <tr key={c.id}>
                              <td>{c.title}</td>
                              <td>{f ? f.name : '—'}</td>
                              <td>
                                <button onClick={() => editCourse(c)}>Edit</button>
                                <button onClick={() => deleteCourse(c.id)}>Delete</button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            )}

            {/* COMPANIES */}
            {activeSection === 'companies' && (
              <section className="admin-section">
                <h3>Companies</h3>
                <div className="list-card">
                  {companies.length === 0 ? (
                    <p className="muted">No companies registered yet.</p>
                  ) : (
                    <table className="admin-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {companies.map((co) => (
                          <tr key={co.id}>
                            <td>{co.name}</td>
                            <td>{co.email}</td>
                            <td>{co.status || 'pending'}</td>
                            <td>
                              <button disabled={companyActionLoading} onClick={() => setCompanyStatus(co.id, 'approved')}>Approve</button>
                              <button disabled={companyActionLoading} onClick={() => setCompanyStatus(co.id, 'suspended')}>Suspend</button>
                              <button disabled={companyActionLoading} onClick={() => deleteCompany(co.id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            )}

            {/* ADMISSIONS & APPLICATIONS */}
            {activeSection === 'admissions' && (
              <section className="admin-section">
                <h3>Admissions & Applications</h3>
                <div className="list-card">
                  <h4>Admissions</h4>
                  {admissions.length === 0 ? <p className="muted">No admissions created.</p> : (
                    <table className="admin-table">
                      <thead><tr><th>Title</th><th>Published</th><th>Actions</th></tr></thead>
                      <tbody>
                        {admissions.map((a) => (
                          <tr key={a.id}>
                            <td>{a.title}</td>
                            <td>{a.published ? 'Yes' : 'No'}</td>
                            <td>
                              {!a.published ? <button onClick={() => publishAdmission(a)}>Publish</button> : <button onClick={() => closeAdmission(a.id)}>Close</button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <h4 style={{ marginTop: 20 }}>Applications</h4>
                  {applications.length === 0 ? <p className="muted">No applications yet.</p> : (
                    <table className="admin-table">
                      <thead><tr><th>Applicant</th><th>Course</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {applications.map((app) => {
                          const course = courses.find((c) => c.id === app.courseId)
                          const user = users.find((u) => u.id === app.userId)
                          return (
                            <tr key={app.id}>
                              <td>{user ? user.name : '—'}</td>
                              <td>{course ? course.title : '—'}</td>
                              <td>{app.status || 'pending'}</td>
                              <td>
                                <button onClick={() => setApplicationStatus(app.id, 'approved')}>Approve</button>
                                <button onClick={() => setApplicationStatus(app.id, 'rejected')}>Reject</button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}

                </div>
              </section>
            )}

            {/* REPORTS */}
            {activeSection === 'reports' && (
              <section className="admin-section">
                <h3>Reports</h3>
                <div className="report-cards grid-2">
                  <div className="card">
                    <h4>Platform Summary</h4>
                    <ul>
                      <li>Total users: {reports.totalUsers}</li>
                      <li>Institutions: {reports.totalInstitutions}</li>
                      <li>Faculties: {reports.totalFaculties}</li>
                      <li>Courses: {reports.totalCourses}</li>
                      <li>Companies: {reports.totalCompanies}</li>
                      <li>Published admissions: {reports.publishedAdmissions}</li>
                      <li>Applications: {reports.totalApplications}</li>
                    </ul>
                  </div>

                  <div className="card">
                    <h4>Quick exports</h4>
                    <p>You can expand this to export CSV/PDF of users, applications, institutions, etc.</p>
                    <button onClick={() => alert('Export CSV placeholder — implement server or client CSV generation')}>Export Users (CSV)</button>
                  </div>
                </div>
              </section>
            )}

            {error && <div className="error">{error}</div>}
          </main>
        )}

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

export default function Admin() {
  return (
    <ProtectedRoute allowedRoles={[ 'admin' ]}>
      <AdminInner />
    </ProtectedRoute>
  )
}
