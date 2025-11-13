import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { db, storage } from '../services/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { mockDB } from '../services/mockDatabase'; // optional for mock data

export default function Dashboard() {
  const auth = getAuth();
  const nav = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    address: '',
    academicLevel: '',
    highSchool: '',
    graduationYear: ''
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

  // Sign out
  const doSignOut = async () => {
    await signOut(auth);
    nav('/login');
  };

  // Load courses, jobs, applications, and documents
  const loadData = async () => {
    try {
      const cSnap = await getDocs(collection(db, 'courses'));
      const jSnap = await getDocs(collection(db, 'jobs'));
      setCourses(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setJobs(jSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading data:', err);
    }

    if (auth.currentUser?.email) {
      setApplications(mockDB.getStudentApplications(auth.currentUser.email) || []);
      setDocuments(mockDB.getStudentDocuments(auth.currentUser.email) || []);
    }
  };

  useEffect(() => { loadData(); }, []);

  const saveProfile = () => {
    if (!profile.fullName || !profile.phone) return alert('Fill in at least your name and phone');
    alert('✅ Profile saved!');
  };

  const uploadDocument = async (docType, file) => {
    if (!file) return alert('Please choose a file first');
    try {
      setUploading(true);
      const uid = auth.currentUser?.uid || 'anonymous';
      const storageRef = ref(storage, `documents/${uid}/${docType}_${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);

      const docData = {
        uid,
        type: docType,
        name: file.name,
        size: file.size,
        contentType: file.type,
        url,
        uploaded: true,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'documents'), docData);
      setDocuments([...documents, docData]);
      alert(`${docType} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const applyToCourse = (course) => {
    if (!profile.fullName) {
      alert('Complete profile before applying!');
      setActiveTab('profile');
      return;
    }

    const requiredDocs = ['transcript', 'certificate', 'id'];
    const hasAll = requiredDocs.every(type => documents.some(d => d.type === type && d.uploaded));
    if (!hasAll) {
      alert('Upload all required documents before applying!');
      setActiveTab('documents');
      return;
    }

    const alreadyApplied = applications.find(a => a.courseId === course.id);
    if (alreadyApplied) {
      alert('Already applied to this course.');
      return;
    }

    const institutionApps = applications.filter(a => a.institution === course.institution);
    if (institutionApps.length >= 2) {
      alert(`Max 2 applications per institution (${course.institution})`);
      return;
    }

    const applicationData = {
      studentId: auth.currentUser.email,
      student: profile.fullName,
      studentEmail: auth.currentUser.email,
      courseId: course.id,
      course: course.title,
      institution: course.institution,
      faculty: course.faculty
    };

    const newApp = mockDB.applyToCourse(applicationData);
    setApplications([...applications, newApp]);
    alert(`Applied to ${course.title} at ${course.institution} ✅`);
  };

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
        {/* TABS */}
        <div className="tabs">
          {['profile', 'documents', 'courses', 'applications', 'jobs'].map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'profile' && (
          <section className="card">
            <h3>Profile</h3>
            <input type="text" placeholder="Full Name" value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} />
            <input type="text" placeholder="Phone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
            <input type="text" placeholder="Address" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} />
            <input type="text" placeholder="Academic Level" value={profile.academicLevel} onChange={e => setProfile({ ...profile, academicLevel: e.target.value })} />
            <input type="text" placeholder="High School" value={profile.highSchool} onChange={e => setProfile({ ...profile, highSchool: e.target.value })} />
            <input type="text" placeholder="Graduation Year" value={profile.graduationYear} onChange={e => setProfile({ ...profile, graduationYear: e.target.value })} />
            <button className="btn-primary full-width" onClick={saveProfile}>Save Profile</button>
          </section>
        )}

        {activeTab === 'documents' && (
          <section className="card">
            <h3>Documents</h3>
            {documentTypes.map(dt => (
              <div key={dt.id} style={{ marginBottom: '10px' }}>
                <label>{dt.name} {dt.required && '*'}</label>
                <input type="file" onChange={e => uploadDocument(dt.id, e.target.files[0])} />
              </div>
            ))}
          </section>
        )}

        {activeTab === 'courses' && (
          <section className="card">
            <h3>Courses</h3>
            {courses.length === 0 && <p>No courses yet</p>}
            <ul>
              {courses.map(c => (
                <li key={c.id}>
                  <strong>{c.title}</strong> — {c.duration} <br />
                  {c.description} <br />
                  <button onClick={() => applyToCourse(c)}>Apply</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === 'applications' && (
          <section className="card">
            <h3>Applications</h3>
            {applications.length === 0 && <p>No applications yet</p>}
            <ul>
              {applications.map(a => (
                <li key={a.applicationId || a.courseId}>
                  {a.course} at {a.institution} — {a.faculty}
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === 'jobs' && (
          <section className="card">
            <h3>Jobs</h3>
            {jobs.length === 0 && <p>No jobs yet</p>}
            <ul>
              {jobs.map(j => (
                <li key={j.id}>
                  <strong>{j.title}</strong>
                  <p>{j.description}</p>
                </li>
              ))}
            </ul>
          </section>
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
  );
}
