import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onNameChange = (e) => setName(e.target.value.replace(/[^A-Za-z\s]/g, ''));
  const onEmailChange = (e) => setEmail(e.target.value.toLowerCase());
  const isValidEmail = (em) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!name || !/^[A-Za-z\s]+$/.test(name)) return setErr('Invalid name');
    if (!email || !isValidEmail(email)) return setErr('Invalid email');
    if (!pw || pw.length < 6) return setErr('Password must be at least 6 characters');

    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, pw);

      // Save user data to Firestore
      await setDoc(doc(db, 'users', res.user.uid), {
        name,
        email,
        role,
        createdAt: new Date()
      });

      // Send email verification
      await sendEmailVerification(res.user);
      alert('Account created! Verification email sent. Check your inbox.');

      // Redirect based on role
      switch (role) {
        case 'student': nav('/dashboard'); break;
        case 'institute': nav('/institute'); break;
        case 'company': nav('/company'); break;
        case 'admin': nav('/admin'); break;
        default: nav('/'); break;
      }
    } catch (error) {
      // Better error messages
      if (error.code === 'auth/email-already-in-use') setErr('Email already registered');
      else if (error.code === 'auth/invalid-email') setErr('Invalid email format');
      else setErr(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">Career<span>Connect</span></div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>

      {/* REGISTER FORM */}
      <div className="auth-wrapper" style={{ paddingTop: '120px' }}>
        <div className="auth-card fade-in">
          <h2>Register</h2>
          <p className="muted">Join CareerConnect and take your next step.</p>
          <form onSubmit={onSubmit}>
            <label>Full Name</label>
            <input
              value={name}
              onChange={onNameChange}
              placeholder="Name"
              required
            />
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={onEmailChange}
              placeholder="Email"
              required
            />
            <label>Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="institute">Institute</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>

            {err && <div className="error-msg">{err}</div>}

            <button className="btn-primary full-width" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <p className="muted" style={{ marginTop: 16 }}>
            Already have an account? <Link to="/login" className="link-accent">Login here</Link>
          </p>
        </div>
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
