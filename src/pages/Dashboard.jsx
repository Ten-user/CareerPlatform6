// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { mockDB } from '../services/mockDatabase';

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

  useEffect(() => {
    if (currentUser?.email) {
      try {
        const studentApps = mockDB.getStudentApplications(currentUser.email) || [];
        const studentDocs = mockDB.getStudentDocuments(currentUser.email) || [];
        const allCourses = mockDB.getAllCourses() || [];

        setApplications(studentApps);
        setDocuments(studentDocs);
        setCourses(allCourses);
      } catch (error) {
        console.error('Error loading data:', error);
        setApplications([]);
        setDocuments([]);
        setCourses([]);
      }
    }
  }, [currentUser]);

  const hasRequiredDocuments = () => {
    const requiredDocTypes = ['transcript', 'certificate', 'id'];
    return requiredDocTypes.every(type =>
      documents.some(doc => doc.type === type && doc.uploaded)
    );
  };

  const applyToCourse = (course) => {
    if (!currentUser?.email) return alert('Please login to apply');
    if (!profile.fullName) {
      alert('Complete profile first');
      setActiveTab('profile');
      return;
    }

    const requiredDocTypes = ['transcript', 'certificate', 'id'];
    const hasAllRequired = requiredDocTypes.every(type =>
      documents.some(doc => doc.type === type && doc.uploaded)
    );
    if (!hasAllRequired) {
      alert('Upload all required documents first');
      setActiveTab('documents');
      return;
    }

    const institutionApplications = applications.filter(app => app.institution === course.institution);
    if (institutionApplications.length >= 2) {
      alert(`Max 2 applications per institution (${course.institution})`);
      return;
    }

    if (applications.find(app => app.courseId === course.id)) {
      alert('Already applied to this course.');
      return;
    }

    const applicationData = {
      studentId: currentUser.email,
      student: profile.fullName,
      studentEmail: currentUser.email,
      courseId: course.id,
      course: course.name,
      institution: course.institution,
      faculty: course.faculty
    };

    const newApplication = mockDB.applyToCourse(applicationData);
    setApplications([...applications, newApplication]);
    alert(`Applied to ${course.name} at ${course.institution}`);
  };

  const handleDocumentUpload = (docType, file) => {
    if (!file || !currentUser?.email) return;
    const documentData = {
      studentEmail: currentUser.email,
      type: docType,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      uploaded: true,
      required: ['transcript', 'certificate', 'id'].includes(docType)
    };
    const newDocument = mockDB.uploadDocument(documentData);
    setDocuments([...documents, newDocument]);
    alert(`${docType.toUpperCase()} uploaded!`);
  };

  const saveProfile = () => {
    if (!profile.fullName || !profile.phone) return alert('Fill full name and phone');
    alert('Profile saved!');
  };

  return (
    <>
      {/* HEADER */}
      <nav className="navbar">
        <div className="logo">Career<span>Connect</span></div>
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
            <h2>📝 Profile</h2>
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
            <h2>📁 Documents</h2>
            {documentTypes.map(doc => (
              <div key={doc.id}>
                <label>{doc.name} {doc.required && '*'}</label>
                <input type="file" onChange={e => handleDocumentUpload(doc.id, e.target.files[0])} />
                <span>{documents.find(d => d.type === doc.id)?.uploaded ? '✅ Uploaded' : '❌ Not uploaded'}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="tab-content">
            <h2>📚 Courses ({courses.length})</h2>
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
            <h2>📄 Applications ({applications.length})</h2>
            {applications.map((app, idx) => (
              <div key={idx} className="application-card">
                <p>{app.course} @ {app.institution}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="tab-content">
            <h2>💼 Jobs</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </main>

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
