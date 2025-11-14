// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { db, storage } from '../services/firebase';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Dashboard() {
  const auth = getAuth();
  const nav = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    fullName: '', phone: '', address: '', academicLevel: '', highSchool: '', graduationYear: ''
  });
  const [documents, setDocuments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    { id: 'transcript', name: 'Academic Transcript', required: true },
    { id: 'certificate', name: 'High School Certificate', required: true },
    { id: 'id', name: 'National ID/Passport', required: true },
    { id: 'photo', name: 'Passport Photo', required: true },
    { id: 'recommendation', name: 'Recommendation Letter', required: false },
    { id: 'other', name: 'Other Documents', required: false }
  ];

  const doSignOut = async () => {
    await signOut(auth);
    nav('/login');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseSnap, jobSnap, appSnap, docSnap] = await Promise.all([
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'jobs')),
        getDocs(query(collection(db, 'applications'), where('studentEmail', '==', auth.currentUser?.email || ''))),
        getDocs(query(collection(db, 'documents'), where('uid', '==', auth.currentUser?.uid || '')))
      ]);

      setCourses(courseSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setJobs(jobSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setApplications(appSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setDocuments(docSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const saveProfile = async () => {
    if (!profile.fullName || !profile.phone) return alert('Please fill in at least your name and phone.');
    try {
      const profileRef = collection(db, 'students');
      await addDoc(profileRef, { uid: auth.currentUser.uid, email: auth.currentUser.email, ...profile, createdAt: serverTimestamp() });
      alert('Profile saved!');
    } catch (err) {
      console.error(err);
      alert('Failed to save profile: ' + err.message);
    }
  };

  const uploadDocument = async (docType, file) => {
    if (!file) return alert('Please choose a file first.');
    try {
      setUploading(true);
      const storageRef = ref(storage, `documents/${auth.currentUser.uid}/${docType}_${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);

      const docData = { uid: auth.currentUser.uid, type: docType, name: file.name, url, uploaded: true, createdAt: serverTimestamp() };
      await addDoc(collection(db, 'documents'), docData);
      setDocuments(prev => [...prev, docData]);
      alert(`${docType} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    } finally { setUploading(false); }
  };

  const applyToCourse = async (course) => {
    if (!profile.fullName) { alert('Complete profile before applying!'); setActiveTab('profile'); return; }

    const requiredDocs = ['transcript', 'certificate', 'id'];
    const hasAll = requiredDocs.every(type => documents.some(d => d.type === type && d.uploaded));
    if (!hasAll) { alert('Upload all required documents before applying!'); setActiveTab('documents'); return; }

    const institutionApps = applications.filter(a => a.institution === course.institution);
    if (institutionApps.length >= 2) { alert(`Max 2 applications per institution (${course.institution})`); return; }

    const alreadyApplied = applications.find(a => a.courseId === course.id);
    if (alreadyApplied) { alert('Already applied to this course.'); return; }

    try {
      const appRef = collection(db, 'applications');
      const appData = {
        studentId: auth.currentUser.uid,
        studentEmail: auth.currentUser.email,
        studentName: profile.fullName,
        courseId: course.id,
        course: course.title,
        institution: course.institution,
        faculty: course.faculty,
        createdAt: serverTimestamp(),
        status: 'pending'
      };
      await addDoc(appRef, appData);
      setApplications(prev => [...prev, appData]);
      alert(`Applied to ${course.title} at ${course.institution}!`);
    } catch (err) {
      console.error(err);
      alert('Failed to apply: ' + err.message);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading dashboard...</p>;

  return (
    <>
      <nav className="navbar">
        <div className="logo">Career<span>Connect</span></div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/">Home</Link>
          <button className="btn-logout" onClick={doSignOut}>Sign Out</button>
        </div>
      </nav>

      <div className="dashboard-wrapper fade-in" style={{ minHeight: '100vh', padding: '20px', overflowY: 'auto' }}>
        <div className="tabs" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['profile','documents','courses','applications','jobs'].map(tab => (
            <button key={tab} className={`btn-primary ${activeTab===tab?'':'btn-outline'}`} onClick={()=>setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

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

        {activeTab==='documents' && (
          <div className="dash-grid">
            <div className="dash-card">
              <h3>Upload Documents</h3>
              {documentTypes.map(dt => (
                <div key={dt.id} className="upload-section">
                  <label>{dt.name}{dt.required?' *':''}</label>
                  <input type="file" onChange={e=>uploadDocument(dt.id,e.target.files[0])}/>
                  {documents.some(d=>d.type===dt.id && d.uploaded) && <small style={{color:'green'}}>Uploaded ✅</small>}
                </div>
              ))}
            </div>
          </div>
        )}

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
            {courses.length === 0 && <p>No courses available</p>}
          </div>
        )}

        {activeTab==='applications' && (
          <div className="dash-grid">
            <div className="dash-card">
              <h3>Your Applications</h3>
              {applications.length === 0 && <p>No applications yet</p>}
              <ul>
                {applications.map(a => (
                  <li key={a.id}><strong>{a.course}</strong> at {a.institution} — {a.faculty} — Status: {a.status}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab==='jobs' && (
          <div className="dash-grid">
            {jobs.length === 0 && <p>No job postings yet</p>}
            {jobs.map(j => (
              <div key={j.id} className="dash-card">
                <h3>{j.title}</h3>
                <p>{j.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

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
