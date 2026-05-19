import { useState } from 'react';
import { api } from '../services/api';

// Demo admin credentials — replace with real auth in production
const ADMIN_EMAIL = 'admin@placeai.com';
const ADMIN_PASS  = 'admin123';

export default function Login({ onLogin }) {
  const [tab,  setTab]  = useState('signin');
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Enter a valid email address.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    try {
      if (tab === 'signup') {
        if (!form.name) { setError('Please enter your full name.'); return; }
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        
        const user = await api.signup({ name: form.name, email: form.email, password: form.password });
        onLogin(user);
        return;
      }

      // Sign in
      const user = await api.login({ email: form.email, password: form.password, role });
      onLogin(user);
    } catch (e) {
      setError(e.message || 'Authentication failed');
    }
  };

  return (
    <div className="login-page">
      {/* ── Left Panel ── */}
      <div className="login-left">
        <div className="login-brand">
          <span className="login-brand-icon">⬡</span>
          <div>
            <div className="login-brand-name">PlaceAI</div>
            <div className="login-brand-sub">Readiness Analyzer</div>
          </div>
        </div>

        <div className="login-hero">
          <h1 className="login-hero-title">
            Predict your <span className="login-accent">placement</span> readiness
          </h1>
          <p className="login-hero-sub">
            AI-powered skill analysis for 150+ students. Get personalized domain recommendations and actionable insights.
          </p>
          <div className="login-stats">
            <div className="login-stat"><span className="login-stat-val">150+</span><span className="login-stat-lbl">Students Analyzed</span></div>
            <div className="login-stat"><span className="login-stat-val">4</span><span className="login-stat-lbl">Career Domains</span></div>
            <div className="login-stat"><span className="login-stat-val">21</span><span className="login-stat-lbl">Skills Tracked</span></div>
          </div>
        </div>

        <div className="login-blobs">
          <div className="blob blob1" /><div className="blob blob2" /><div className="blob blob3" />
        </div>

        {/* Feature cards */}
        <div className="login-features">
          {[
            { icon: '🎯', title: 'AI Job Matching',       desc: 'Get matched to roles with % compatibility' },
            { icon: '📊', title: 'Skill Gap Analysis',    desc: 'See exactly what skills you need to build' },
            { icon: '🗺️', title: 'Learning Roadmap',      desc: 'Week-by-week personalized study plan' },
            { icon: '🤖', title: 'ML Readiness Score',    desc: 'Predicted by Random Forest & Logistic models' },
          ].map(f => (
            <div key={f.title} className="login-feature-card">
              <span className="login-feature-icon">{f.icon}</span>
              <div>
                <div className="login-feature-title">{f.title}</div>
                <div className="login-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── Right Panel ── */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">
              {tab === 'signin' ? 'Welcome back 👋' : 'Create account 🚀'}
            </h2>
            <p className="login-card-sub">
              {tab === 'signin' ? 'Sign in to access your dashboard' : 'Join PlaceAI and analyze your readiness'}
            </p>
          </div>

          {/* Sign In / Sign Up tabs */}
          <div className="login-tabs">
            <button className={`login-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); setError(''); }}>Sign In</button>
            <button className={`login-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
          </div>

          {/* Role selector — only on Sign In */}
          {tab === 'signin' && (
            <div className="role-selector">
              <button
                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                🎓 Student
              </button>
              <button
                className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                🛡️ Admin
              </button>
            </div>
          )}

          {role === 'admin' && tab === 'signin' && (
            <div className="admin-hint">
              Admin credentials: <strong>admin@placeai.com</strong> / <strong>admin123</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {tab === 'signup' && (
              <div className="login-field">
                <label>Full Name</label>
                <input type="text" placeholder="e.g. Anushka Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
            )}
            <div className="login-field">
              <label>Email Address</label>
              <input type="email" placeholder="you@college.edu" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            {tab === 'signup' && (
              <div className="login-field">
                <label>Confirm Password</label>
                <input type="password" placeholder="Re-enter your password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
              </div>
            )}

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-btn">
              {tab === 'signin' ? `Sign In as ${role === 'admin' ? 'Admin' : 'Student'} →` : 'Create Account →'}
            </button>
          </form>

          <div className="login-footer-note">
            {tab === 'signin'
              ? <>Don't have an account? <span className="login-link" onClick={() => { setTab('signup'); setError(''); }}>Sign Up</span></>
              : <>Already have an account? <span className="login-link" onClick={() => { setTab('signin'); setError(''); }}>Sign In</span></>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
