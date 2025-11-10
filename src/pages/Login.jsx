import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      // Sign in user
      const res = await signInWithEmailAndPassword(auth, email.toLowerCase(), pw);

      // Get user profile from Firestore
      const snap = await getDoc(doc(db, 'users', res.user.uid));

      if (!snap.exists()) {
        setErr('User profile not found. Contact support.');
        setLoading(false);
        return;
      }

      const user = snap.data();

      // Navigate based on role
      switch (user.role) {
        case 'student':
          nav('/dashboard');
          break;
        case 'institute':
          nav('/institute');
          break;
        case 'company':
          nav('/company');
          break;
        case 'admin':
          nav('/admin');
          break;
        default:
          nav('/');
      }

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErr('Invalid email or password.');
      } else {
        setErr('Login failed. Check your internet connection.');
      }
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

      {/* LOGIN FORM */}
      <div className="auth-wrapper" style={{ paddingTop: '120px' }}>
        <div className="auth-card fade-in">
          <h2>Welcome Back</h2>
          <p className="muted">Login to your CareerConnect account</p>

          <form onSubmit={onSubmit}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              placeholder="example@gmail.com"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Your password"
              required
            />

            {err && <div className="error-msg">{err}</div>}

            <button className="btn-primary full-width" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="muted" style={{ marginTop: 16 }}>
            Don’t have an account? <Link to="/register" className="link-accent">Register here</Link>
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
