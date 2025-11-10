import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

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

      const uid = res.user.uid;
      let snap;

      try {
        snap = await getDocFromServer(doc(db, 'users', uid));
      } catch (fetchErr) {
        console.error(fetchErr);
        setErr('Cannot fetch user profile. Check your internet connection.');
        setLoading(false);
        return;
      }

      if (!snap.exists()) {
        setErr('No user profile found in database.');
        setLoading(false);
        return;
      }

      const user = snap.data();
      switch (user.role) {
        case 'student': nav('/dashboard'); break;
        case 'institute': nav('/institute'); break;
        case 'company': nav('/company'); break;
        case 'admin': nav('/admin'); break;
        default: nav('/'); 
      }

    } catch (loginErr) {
      console.error(loginErr);
      setErr('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">Career<span>Connect</span></div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>

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
    </>
  );
}
