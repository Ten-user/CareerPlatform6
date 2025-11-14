import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { db, storage } from '../services/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { mockDB } from '../services/mockDatabase';

export default function Dashboard() {
  const auth = getAuth();
  const nav = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ fullName: '', phone: '', address: '', academicLevel: '', highSchool: '', graduationYear: '' });
  const [documents, setDocuments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const documentTypes = [
    { id: 'transcript', name: 'Academic Transcript', required: true },
    { id: 'certificate', name: 'High School Certificate', required: true },
    { id: 'id', name: 'National ID/Passport', required: true },
    { id: 'photo', name: 'Passport Photo', required: true },
    { id: 'recommendation', name: 'Recommendation Letter', required: false },
    { id: 'other', name: 'Other Documents', required: false }
  ];

  // ---------------------- AUTH / NAV ----------------------
  const doSignOut = async () => {
    await signOut(auth);
    nav('/login');
  };

  // ---------------------- LOAD DATA (uses mockDB for A) ----------------------
  const loadData = async () => {
    try {
      const cSnap = await getDocs(collection(db, 'courses'));
      const jSnap = await getDocs(collection(db, 'jobs'));
      setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setJobs(jSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      // Firestore might not be configured yet, that's fine under Option A
      console.warn('Firestore load skipped or failed (option A).', err?.message || err);
    }

    if (auth.currentUser?.email) {
      // mockDB provides instant sample data for development
      setApplications(mockDB.getStudentApplications(auth.currentUser.email) || []);
      setDocuments(mockDB.getStudentDocuments(auth.currentUser.email) || []);
      setNotifications(mockDB.getNotifications(auth.currentUser.email) || []);
      // also load jobs/courses from mockDB if Firestore empty
      if (!courses.length) setCourses(mockDB.getCourses());
      if (!jobs.length) setJobs(mockDB.getJobs());
    }
  };

  useEffect(() => { loadData(); }, []);

  // ---------------------- PROFILE ----------------------
  const saveProfile = () => {
    if (!profile.fullName || !profile.phone) return alert('Fill in at least your name and phone');
    // Save locally to mockDB and show success
    if (auth.currentUser?.email) mockDB.saveStudentProfile(auth.currentUser.email, profile);
    alert('✅ Profile saved!');
  };

  // ---------------------- DOCUMENT UPLOAD ----------------------
  const uploadDocument = async (docType, file, postCompletion = false) => {
    if (!file) return alert('Please choose a file first');
    try {
      setUploading(true);
      // If storage not configured, mock a URL
      let url = '';
      try {
        const uid = auth.currentUser?.uid || 'anonymous';
        const storageRef = ref(storage, `documents/${uid}/${docType}_${Date.now()}_${file.name}`);
        const snap = await uploadBytes(storageRef, file);
        url = await getDownloadURL(snap.ref);
      } catch (err) {
        // Storage not configured — create a mock URL
        console.warn('Storage upload skipped (mock).', err?.message || err);
        url = `https://mock.storage/${docType}/${Date.now()}/${file.name}`;
      }

      const docData = { uid: auth.currentUser?.uid || 'anon', type: docType, name: file.name, size: file.size, contentType: file.type, url, uploaded: true, postCompletion, createdAt: new Date().toISOString() };

      // Save to Firestore if available, otherwise save to mockDB
      try {
        await addDoc(collection(db, 'documents'), { ...docData, createdAt: serverTimestamp() });
      } catch (err) {
        console.warn('Firestore addDoc skipped (mock).', err?.message || err);
        if (auth.currentUser?.email) mockDB.saveStudentDocument(auth.currentUser.email, docData);
      }

      setDocuments(prev => [...prev, docData]);
      alert(`${docType} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + (err.message || err));
    } finally { setUploading(false); }
  };

  // ---------------------- APPLY TO COURSE ----------------------
  const applyToCourse = (course) => {
    if (!profile.fullName) { alert('Complete profile before applying!'); setActiveTab('profile'); return; }

    const requiredDocs = ['transcript', 'certificate', 'id'];
    const hasAll = requiredDocs.every(type => documents.some(d => d.type === type && d.uploaded));
    if (!hasAll) { alert('Upload all required documents before applying!'); setActiveTab('documents'); return; }

    const alreadyApplied = applications.find(a => a.courseId === course.id);
    if (alreadyApplied) { alert('Already applied to this course.'); return; }

    const institutionApps = applications.filter(a => a.institution === course.institution);
    if (institutionApps.length >= 2) { alert(`Max 2 applications per institution (${course.institution})`); return; }

    // Simulate application scoring using mock rules
    const score = mockDB.evaluateApplication({ profile, documents, course });

    const applicationData = { applicationId: `app_${Date.now()}`, studentId: auth.currentUser.email, student: profile.fullName, studentEmail: auth.currentUser.email, courseId: course.id, course: course.title, institution: course.institution, faculty: course.faculty, score, status: 'pending', appliedAt: new Date().toISOString() };

    const newApp = mockDB.applyToCourse(applicationData);
    setApplications(prev => [...prev, newApp]);

    // Notify user
    mockDB.pushNotification(auth.currentUser.email, { id: `n_${Date.now()}`, title: 'Application submitted', message: `You applied to ${course.title} at ${course.institution}`, date: new Date().toISOString(), read: false });
    setNotifications(mockDB.getNotifications(auth.currentUser.email));

    alert(`Applied to ${course.title} at ${course.institution} ✅ (Score: ${score})`);
  };

  // ---------------------- APPLY TO JOB ----------------------
  const applyToJob = (job) => {
    if (!profile.fullName) { alert('Complete profile before applying to jobs!'); setActiveTab('profile'); return; }

    // Basic matching: check if student's academicLevel or skills (mock) match job.qualifications
    const qualifies = mockDB.doesStudentQualifyForJob({ profile, documents, job });
    if (!qualifies) { alert('You do not meet the job qualifications.'); return; }

    // Prevent duplicate
    const already = mockDB.getJobApplications(auth.currentUser.email).find(a => a.jobId === job.id);
    if (already) { alert('Already applied to this job.'); return; }

    const app = mockDB.applyToJob({ jobId: job.id, studentEmail: auth.currentUser.email, student: profile.fullName, appliedAt: new Date().toISOString(), status: 'submitted' });
    setNotifications(mockDB.getNotifications(auth.currentUser.email));
    alert(`Applied to job: ${job.title} — Await employer review.`);
  };

  // ---------------------- VIEW ADMISSIONS RESULTS ----------------------
  const refreshAdmissions = () => {
    const results = mockDB.getAdmissionsForStudent(auth.currentUser.email) || [];
    // Merge into applications state if any status updates
    const updated = applications.map(a => {
      const r = results.find(res => res.courseId === a.courseId);
      return r ? { ...a, status: r.status, decisionAt: r.decisionAt } : a;
    });
    setApplications(updated);
    if (results.length) setNotifications(prev => [...prev, ...results.map(r => ({ id: `adm_${r.courseId}`, title: 'Admission Update', message: `${r.status.toUpperCase()}: ${r.course}`, date: r.decisionAt || new Date().toISOString(), read: false }))]);
  };

  // ---------------------- NOTIFICATIONS ----------------------
  const markNotificationRead = (id) => {
    mockDB.markNotificationRead(auth.currentUser.email, id);
    setNotifications(mockDB.getNotifications(auth.currentUser.email));
  };

  // ---------------------- POST-COMPLETION UPLOAD ----------------------
  const uploadPostCompletion = (file) => uploadDocument('transcript', file, true);

  // ---------------------- UI ----------------------
  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">Career<span>Connect</span></div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/">Home</Link>
          <button className="btn-logout" onClick={doSignOut}>Sign Out</button>
        </div>
      </nav>

      <div className="dashboard-wrapper fade-in">
        {/* header + notifications */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{margin:0}}>Student Dashboard</h2>
          <div>
            <button onClick={() => { setActiveTab('notifications'); setNotifications(mockDB.getNotifications(auth.currentUser.email)); }}>Notifications ({notifications.filter(n=>!n.read).length})</button>
            <button onClick={refreshAdmissions}>Refresh Admissions</button>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs" style={{ display: 'flex', gap: '12px', margin: '12px 0' }}>
          {['profile','documents','courses','applications','jobs','notifications'].map(tab => (
            <button key={tab} className={`btn-primary ${activeTab===tab?'':'btn-outline'}`} onClick={()=>setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* PROFILE */}
        {activeTab==='profile' && (
          <div className="dash-grid">
            <div className="dash-card">
              <h3>Profile</h3>
              {['fullName','phone','address','academicLevel','highSchool','graduationYear'].map(field => (
                <input key={field} type="text" placeholder={field.replace(/([A-Z])/g,' $1')} value={profile[field]} onChange={e=>setProfile({...profile,[field]:e.target.value})} />
              ))}
              <button className="btn-primary full-width" onClick={saveProfile}>Save Profile</button>
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {activeTab==='documents' && (
          <div className="dash-grid">
            <div className="dash-card">
              <h3>Upload Documents</h3>
              {documentTypes.map(dt => (
                <div key={dt.id} className="upload-section" style={{marginBottom:12}}>
                  <label>{dt.name}{dt.required?' *':''}</label>
                  <input type="file" onChange={e=>uploadDocument(dt.id,e.target.files[0])}/>
                  {documents.some(d=>d.type===dt.id && d.uploaded) && <small style={{color:'green'}}>Uploaded ✅</small>}
                </div>
              ))}

              <hr />
              <h4>Post-Completion Documents</h4>
              <p className="muted">If you've completed studies, upload final transcripts & additional certificates here.</p>
              <input type="file" onChange={e=>uploadPostCompletion(e.target.files[0])} />
            </div>
          </div>
        )}

        {/* COURSES */}
        {activeTab==='courses' && (
          <div className="dash-grid">
            {courses.map(c => (
              <div key={c.id} className="dash-card">
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <p><strong>Institution:</strong> {c.institution}</p>
                <p><strong>Faculty:</strong> {c.faculty}</p>
                <button className="btn-primary full-width" onClick={()=>applyToCourse(c)}>Apply</button>
              </div>
            ))}
          </div>
        )}

        {/* APPLICATIONS */}
        {activeTab==='applications' && (
          <div className="dash-grid">
            <div className="dash-card">
              <h3>Your Applications</h3>
              <ul>
                {applications.length===0 && <li>No applications yet</li>}
                {applications.map(a=>{
                  return (
                    <li key={a.applicationId || a.courseId} style={{marginBottom:8}}>
                      <strong>{a.course}</strong> at {a.institution} — {a.faculty}
                      <div className="muted" style={{fontSize:12}}>Status: {a.status || 'pending'}{a.score?` • Score: ${a.score}`:''}</div>
                      {a.status && a.status!=='pending' && <div style={{marginTop:6}}><small>Decision at: {a.decisionAt || '—'}</small></div>}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}

        {/* JOBS */}
        {activeTab==='jobs' && (
          <div className="dash-grid">
            {jobs.map(j => (
              <div key={j.id} className="dash-card">
                <h3>{j.title}</h3>
                <p>{j.description}</p>
                {j.qualifications && <p><strong>Qualifications:</strong> {j.qualifications}</p>}
                <button className="btn-primary full-width" onClick={()=>applyToJob(j)}>Apply to Job</button>
              </div>
            ))}
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab==='notifications' && (
          <div className="dash-grid">
            <div className="dash-card">
              <h3>Notifications</h3>
              {notifications.length===0 && <p className="muted">No notifications</p>}
              <ul>
                {notifications.map(n=> (
                  <li key={n.id} style={{marginBottom:8}}>
                    <strong>{n.title}</strong>
                    <div className="muted">{n.message}</div>
                    <div style={{marginTop:6}}>
                      <button onClick={()=>markNotificationRead(n.id)}>Mark read</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
        <div className="footer-bottom">© {new Date().getFullYear()} CareerConnect. All rights reserved.</div>
      </footer>
    </>
  );
}
