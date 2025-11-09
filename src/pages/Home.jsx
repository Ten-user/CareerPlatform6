// frontend/src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-wrapper">
      {/* ==== NAVBAR ==== */}
      <nav className="navbar">
        <div className="logo">Career<span>Connect</span></div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>

      {/* ==== HERO SECTION ==== */}
      <section className="hero">
        <div className="overlay">
          <div className="hero-content">
            <h1>Empower Your Future</h1>
            <p>
              Bridging the gap between education and employment — discover
              opportunities that match your ambition.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn-primary">Get Started</Link>
              <Link to="/login" className="btn-outline">Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==== FEATURES ==== */}
      <section className="features">
        <h2>What Makes CareerConnect Unique?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>🎓 Student Pathways</h3>
            <p>Find institutions and jobs that align with your skills and goals.</p>
          </div>
          <div className="feature-card">
            <h3>🏫 Smart Institutions</h3>
            <p>Manage courses, admissions, and connect with top employers effortlessly.</p>
          </div>
          <div className="feature-card">
            <h3>💼 Verified Companies</h3>
            <p>Hire pre-screened, qualified students with a transparent profile system.</p>
          </div>
          <div className="feature-card">
            <h3>⚡ Secure & Fast</h3>
            <p>Powered by Firebase, ensuring speed, safety, and scalability across devices.</p>
          </div>
        </div>
      </section>

      {/* ==== CTA ==== */}
      <section className="cta">
        <h2>Ready to Transform Your Career Journey?</h2>
        <p>Join thousands of students, institutions, and companies already on CareerConnect.</p>
        <Link to="/register" className="btn-primary large">Join Now</Link>
      </section>

      {/* ==== FOOTER ==== */}
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
    </div>
  );
}
