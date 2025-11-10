import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

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
      const res = await signInWithEmailAndPassword(auth, email.toLowerCase(), pw);
      console.log('Logged in:', res.user.uid, res.user.email);

      // Redirect to dashboard (or change for role-based pages later)
      nav('/dashboard');

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found') setErr('User not found');
      else if (error.code === 'auth/wrong-password') setErr('Incorrect password');
      else if (error.code === 'auth/invalid-email') setErr('Invalid email');
      else setErr('Failed to login. Check your credentials.');
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
