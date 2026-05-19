// src/pages/StudentReport.jsx
import { useState } from 'react';
import { api } from '../services/api';

const DOMAIN_COLORS = {
  'Data & AI':     'var(--purple)',
  'IT / Software': 'var(--orange)',
  'Design':        'var(--teal)',
  'Marketing':     'var(--warning)',
};

const LEARNING = {
  'Data & AI': {
    courses:   ['Machine Learning — Coursera (Andrew Ng)', 'Python for Data Science — Kaggle', 'SQL for Data Analysis — Mode'],
    projects:  ['Build a movie recommendation system', 'Predict house prices with regression', 'Sentiment analysis on tweets'],
    platforms: ['LeetCode (DSA)', 'Kaggle (ML)', 'HackerRank (SQL)'],
  },
  'IT / Software': {
    courses:   ['Full Stack Web Dev — The Odin Project', 'DSA in Java/Python — Udemy', 'System Design — Grokking'],
    projects:  ['Build a REST API with Flask/Node', 'Clone a popular app (Twitter/Notion)', 'Deploy an app on AWS/Heroku'],
    platforms: ['LeetCode', 'CodeChef', 'GitHub (open source)'],
  },
  'Design': {
    courses:   ['UI/UX Design — Google UX Certificate', 'Figma Masterclass — YouTube', 'Graphic Design — Canva Design School'],
    projects:  ['Redesign an existing app UI', 'Create a brand identity kit', 'Build a portfolio website'],
    platforms: ['Dribbble', 'Behance', 'Figma Community'],
  },
  'Marketing': {
    courses:   ['Digital Marketing — Google Skillshop', 'SEO Fundamentals — Semrush Academy', 'Content Strategy — HubSpot'],
    projects:  ['Run a mock Google Ads campaign', 'Write 5 SEO-optimized blog posts', 'Build a social media content calendar'],
    platforms: ['Google Analytics', 'HubSpot Free', 'Canva'],
  },
};

function BarRow({ label, val, color }) {
  return (
    <div className="bar-row">
      <div className="bar-meta"><span>{label}</span><span>{val}%</span></div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${val}%`, background: color || 'var(--orange)' }} />
      </div>
    </div>
  );
}

export default function StudentReport({ user }) {
  const [form, setForm]     = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');

  // Reuse Analyzer form inline for student
  const INIT = {
    name: user.name, email: user.email,
    year: '', branch: '', cgpa: '', projects: '',
    internship: 'NO', certifications: 'NO', interested_domain: '', self_rating: 3,
    comm_rating:0, aptitude_rating:0, ps_rating:0, teamwork_rating:0, adapt_rating:0,
    prog_rating:0, dsa_rating:0, webdev_rating:0, sql_rating:0,
    ml_rating:0, da_rating:0, cloud_rating:0, cyber_rating:0,
    dm_rating:0, seo_rating:0, content_rating:0, social_rating:0,
    uiux_rating:0, graphic_rating:0, video_rating:0, creativity_rating:0,
  };

  const startForm = () => { setForm(INIT); setResult(null); setSaved(false); setError(''); };
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const analyze = async () => {
    if (!form.cgpa)              { setError('Please select your CGPA range.'); return; }
    if (!form.interested_domain) { setError('Please select your interested domain.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await api.quickAnalyze(form);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setLoading(true);
    try {
      const student = await api.createStudent(form);
      await api.analyzeStudent(student.id);
      setSaved(true); setError('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const SKILLS = [
    { key:'comm_rating', label:'Communication' }, { key:'aptitude_rating', label:'Aptitude' },
    { key:'ps_rating', label:'Problem Solving' }, { key:'teamwork_rating', label:'Teamwork' },
    { key:'adapt_rating', label:'Adaptability' }, { key:'prog_rating', label:'Programming' },
    { key:'dsa_rating', label:'DSA' }, { key:'webdev_rating', label:'Web Dev' },
    { key:'sql_rating', label:'SQL' }, { key:'ml_rating', label:'ML' },
    { key:'da_rating', label:'Data Analysis' }, { key:'cloud_rating', label:'Cloud/DevOps' },
    { key:'uiux_rating', label:'UI/UX' }, { key:'creativity_rating', label:'Creativity' },
  ];

  // ── Landing state ──
  if (!form && !result) return (
    <div>
      <div className="page-title">My Placement Report</div>
      <div className="page-sub">Analyze your skills and get personalized career guidance.</div>

      <div className="student-welcome">
        <div className="welcome-avatar">🎓</div>
        <div className="welcome-text">
          <h3>Hello, {user.name}!</h3>
          <p>Fill in your skill ratings to get your personalized placement readiness report, job role recommendations, and a learning roadmap.</p>
        </div>
        <button className="btn btn-primary" onClick={startForm} style={{ whiteSpace: 'nowrap' }}>
          Start Analysis →
        </button>
      </div>

      <div className="row3" style={{ marginTop: '1.5rem' }}>
        {[
          { icon: '◈', title: 'Readiness Score', desc: 'Know exactly where you stand for placements', color: 'var(--orange)' },
          { icon: '🎯', title: 'Job Role Match', desc: 'See which roles suit your skill profile best', color: 'var(--purple)' },
          { icon: '🗺️', title: 'Learning Roadmap', desc: 'Get a personalized week-by-week study plan', color: 'var(--teal)' },
        ].map(c => (
          <div key={c.title} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: c.color, marginBottom: 6 }}>{c.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Result view ──
  if (result) {
    const learn = LEARNING[result.best_domain] || {};
    const readyColor = result.readiness === 'Ready' ? 'var(--success)' : 'var(--danger)';
    return (
      <div>
        <div className="page-title">Your Readiness Report</div>
        <div className="page-sub">Personalized analysis for {user.name}</div>

        {/* Score card */}
        <div className="card" style={{ borderLeft: `4px solid ${readyColor}`, background: result.readiness === 'Ready' ? 'var(--success-dim)' : 'var(--danger-dim)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text2)', marginBottom: 6 }}>Best Domain Match</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: DOMAIN_COLORS[result.best_domain] || 'var(--orange)', marginBottom: 8 }}>{result.best_domain}</div>
              <span style={{ background: result.readiness === 'Ready' ? 'var(--success-dim)' : 'var(--danger-dim)', color: readyColor, border: `1px solid ${readyColor}`, padding: '4px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600 }}>
                {result.readiness === 'Ready' ? '✓ Placement Ready' : '✗ Not Ready Yet'}
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 48, fontWeight: 700, color: readyColor, lineHeight: 1 }}>{result.readiness_pct}%</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 4 }}>Readiness Score</div>
            </div>
          </div>
        </div>

        <div className="row2">
          {/* Domain compatibility */}
          <div className="card">
            <div className="card-title">🎯 Job Role Compatibility</div>
            {Object.entries(result.domain_scores).sort((a,b) => b[1].pct - a[1].pct).map(([domain, data]) => (
              <BarRow key={domain} label={domain} val={data.pct} color={DOMAIN_COLORS[domain]} />
            ))}
          </div>

          {/* Strengths & Gaps */}
          <div>
            <div className="card">
              <div className="card-title" style={{ color: 'var(--success)' }}>✓ Your Strengths</div>
              <div className="tag-row">
                {result.strengths.length > 0
                  ? result.strengths.map(s => <span key={s} className="tag tag-success">{s}</span>)
                  : <span style={{ fontSize: 12, color: 'var(--text3)' }}>Rate skills to see strengths</span>}
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{ color: 'var(--danger)' }}>✗ Skill Gaps to Fix</div>
              <div className="tag-row">
                {result.gaps.length > 0
                  ? result.gaps.map(s => <span key={s} className="tag tag-danger">{s}</span>)
                  : <span style={{ fontSize: 12, color: 'var(--success)' }}>No major gaps!</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Learning Roadmap */}
        <div className="card">
          <div className="card-title">🗺️ Personalized Learning Roadmap — {result.best_domain}</div>
          <div className="row3">
            <div>
              <div className="section-label" style={{ color: 'var(--orange)' }}>📚 Recommended Courses</div>
              {(learn.courses || []).map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--orange)', fontWeight: 700, minWidth: 18 }}>{i+1}.</span>{c}
                </div>
              ))}
            </div>
            <div>
              <div className="section-label" style={{ color: 'var(--purple)' }}>🛠️ Project Ideas</div>
              {(learn.projects || []).map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--purple)', fontWeight: 700, minWidth: 18 }}>{i+1}.</span>{p}
                </div>
              ))}
            </div>
            <div>
              <div className="section-label" style={{ color: 'var(--teal)' }}>🏆 Practice Platforms</div>
              {(learn.platforms || []).map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--teal)', fontWeight: 700, minWidth: 18 }}>{i+1}.</span>{p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action plan */}
        <div className="card">
          <div className="card-title">📋 Action Plan</div>
          {result.advice.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < result.advice.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--orange)', fontWeight: 700, minWidth: 24 }}>0{i+1}</span>
              <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{a}</span>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {saved && <div className="alert alert-success">✓ Profile saved successfully!</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          {!saved && <button className="btn btn-success" onClick={save} disabled={loading}>{loading ? <span className="spinner" /> : 'Save My Profile'}</button>}
          <button className="btn" onClick={startForm}>← Analyze Again</button>
        </div>
      </div>
    );
  }

  // ── Form view ──
  return (
    <div>
      <div className="page-title">Skill Assessment</div>
      <div className="page-sub">Rate your skills honestly for an accurate readiness prediction.</div>

      <div className="card">
        <div className="card-title">Profile</div>
        <div className="form-grid">
          <div className="field"><label>Full Name</label>
            <input value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div className="field"><label>Email</label>
            <input value={form.email} readOnly style={{ opacity: 0.7 }} />
          </div>
          <div className="field"><label>Year</label>
            <select value={form.year} onChange={e => update('year', e.target.value)}>
              <option value="">Select year</option>
              {['1st','2nd','3rd','4th'].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="field"><label>Branch</label>
            <select value={form.branch} onChange={e => update('branch', e.target.value)}>
              <option value="">Select branch</option>
              {['AIML','CSE','ISE','ECE','EEE','Mechanical','Civil','MCA','Other'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="field"><label>CGPA</label>
            <select value={form.cgpa} onChange={e => update('cgpa', e.target.value)}>
              <option value="">Select CGPA</option>
              {['9+','8-9','7-8','6-7','Below 6'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field"><label>Projects</label>
            <select value={form.projects} onChange={e => update('projects', e.target.value)}>
              <option value="">Select range</option>
              {['0','1-2','3-5','5+'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="field"><label>Interested Domain</label>
            <select value={form.interested_domain} onChange={e => update('interested_domain', e.target.value)}>
              <option value="">Select domain</option>
              {['Data & AI','IT / Software','Design','Marketing'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field"><label>Internship</label>
            <select value={form.internship} onChange={e => update('internship', e.target.value)}>
              <option>NO</option><option>YES</option>
            </select>
          </div>
          <div className="field"><label>Certifications</label>
            <select value={form.certifications} onChange={e => update('certifications', e.target.value)}>
              <option>NO</option><option>YES</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Skill Ratings (0 = none, 5 = expert)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
          {SKILLS.map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <div style={{ minWidth: 140, fontSize: 13, color: 'var(--text2)' }}>{s.label}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => update(s.key, n)} style={{
                    width: 30, height: 30, borderRadius: 6, border: '1.5px solid',
                    cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                    background: form[s.key] >= n && n > 0 ? 'var(--orange-dim)' : 'var(--bg3)',
                    borderColor: form[s.key] >= n && n > 0 ? 'var(--orange-border)' : 'var(--border)',
                    color: form[s.key] >= n && n > 0 ? 'var(--orange)' : 'var(--text3)',
                  }}>{n}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <button className="btn btn-primary" onClick={analyze} disabled={loading} style={{ width: '100%', padding: 14 }}>
        {loading ? <span className="spinner" /> : 'Analyze My Placement Readiness →'}
      </button>
    </div>
  );
}
