// src/pages/Dashboard.js
import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard({ currentUser }) {
  const auth = getAuth();
  const nav = useNavigate();

  // Tab states
  const [activeTab, setActiveTab] = useState('profile');
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    address: '',
    academicLevel: '',
    highSchool: '',
    graduationYear: ''
  });

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

  const saveProfile = () => {
    if (!profile.fullName || !profile.phone) {
      alert('Please fill in full name and phone.');
      return;
    }
    alert('Profile saved!');
  };

  const handleDocumentUpload = (docType, file) => {
    if (!file) return;
    const newDocument = {
      type: docType,
      name: file.name,
      uploaded: true,
      required: documentTypes.find(d => d.id === docType)?.required || false
    };
    setDocuments([...documents, newDocument]);
    alert(`${docType.toUpperCase()} uploaded!`);
  };

  const applyToCourse = (course) => {
    if (!profile.fullName) {
      alert('Complete profile first');
      setActiveTab('profile');
      return;
    }
    alert(`Applied to ${course.name} at ${course.institution}`);
  };

  return (
    <>
      {/* HEADER */}
      <nav className="navbar">
        <div className="logo">CareerConnect</div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/">Home</Link>
          <button className="btn-logout" onClick={doSignOut}>Sign Out</button>
        </div>
      </nav>

      {/* SIDEBAR / TAB NAV */}
      <aside className="sidebar">
        <button onClick={() => setActiveTab('profile')}>Profile</button>
        <button onClick={() => setActiveTab('documents')}>Documents</button>
        <button onClick={() => setActiveTab('courses')}>Courses</button>
        <button onClick={() => setActiveTab('applications')}>Applications</button>
        <button onClick={() => setActiveTab('jobs')}>Jobs</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-content">
        {activeTab === 'profile' && (
          <div className="tab-content">
            <h2>Profile</h2>
            <input type="text" placeholder="Full Name" value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} />
            <input type="text" placeholder="Phone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
            <input type="text" placeholder="Address" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} />
            <input type="text" placeholder="Academic Level" value={profile.academicLevel} onChange={e => setProfile({ ...profile, academicLevel: e.target.value })} />
            <input type="text" placeholder="High School" value={profile.highSchool} onChange={e => setProfile({ ...profile, highSchool: e.target.value })} />
            <input type="text" placeholder="Graduation Year" value={profile.graduationYear} onChange={e => setProfile({ ...profile, graduationYear: e.target.value })} />
            <button onClick={saveProfile}>Save Profile</button>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="tab-content">
            <h2>Documents</h2>
            {documentTypes.map(doc => (
              <div key={doc.id}>
                <label>{doc.name} {doc.required && '*'}</label>
                <input type="file" onChange={e => handleDocumentUpload(doc.id, e.target.files[0])} />
                <span>{documents.find(d => d.type === doc.id)?.uploaded ? 'Uploaded' : 'Not uploaded'}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="tab-content">
            <h2>Courses</h2>
            {courses.length === 0 && <p>No courses available</p>}
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <h3>{course.name}</h3>
                <p>{course.institution} • {course.faculty}</p>
                <button onClick={() => applyToCourse(course)}>Apply</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="tab-content">
            <h2>Applications</h2>
            {applications.length === 0 && <p>No applications yet</p>}
            {applications.map((app, idx) => (
              <div key={idx} className="application-card">
                <p>{app.course} @ {app.institution}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="tab-content">
            <h2>Jobs</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-columns">
          <div>
            <h3>CareerConnect</h3>
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
