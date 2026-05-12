// src/pages/Analyzer.jsx
import { useState } from 'react';
import { api } from '../services/api';

const CORE_SKILLS = [
  { key: 'comm_rating',     label: 'Communication' },
  { key: 'aptitude_rating', label: 'Aptitude' },
  { key: 'ps_rating',       label: 'Problem Solving' },
  { key: 'teamwork_rating', label: 'Teamwork' },
  { key: 'adapt_rating',    label: 'Adaptability' },
];

const TECH_SKILLS = [
  { key: 'prog_rating',   label: 'Programming (Python/Java)' },
  { key: 'dsa_rating',    label: 'DSA' },
  { key: 'webdev_rating', label: 'Web Development' },
  { key: 'sql_rating',    label: 'SQL / Databases' },
  { key: 'ml_rating',     label: 'Machine Learning' },
  { key: 'da_rating',     label: 'Data Analysis' },
  { key: 'cloud_rating',  label: 'Cloud / DevOps' },
  { key: 'cyber_rating',  label: 'Cybersecurity' },
];

const CREATIVE_SKILLS = [
  { key: 'dm_rating',       label: 'Digital Marketing' },
  { key: 'seo_rating',      label: 'SEO' },
  { key: 'content_rating',  label: 'Content Writing' },
  { key: 'social_rating',   label: 'Social Media' },
  { key: 'uiux_rating',     label: 'UI/UX Design' },
  { key: 'graphic_rating',  label: 'Graphic Design' },
  { key: 'video_rating',    label: 'Video Editing' },
  { key: 'creativity_rating', label: 'Creativity' },
];

const DOMAIN_COLORS = {
  'Data & AI':     'var(--purple)',
  'IT / Software': 'var(--accent)',
  'Design':        'var(--teal)',
  'Marketing':     'var(--warning)',
};

function RatingRow({ label, fieldKey, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ minWidth: 170, fontSize: 13, color: 'var(--text2)' }}>{label}</div>
      <div style={{ display: 'flex', gap: 5 }}>
        {[0,1,2,3,4,5].map(n => (
          <button
            key={n}
            onClick={() => onChange(fieldKey, n)}
            style={{
              width: 32, height: 32, borderRadius: 6, border: '0.5px solid',
              cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
              transition: 'all 0.15s',
              background: value >= n && n > 0 ? 'var(--accent-dim)' : 'var(--bg3)',
              borderColor: value >= n && n > 0 ? 'var(--accent-border)' : 'var(--border)',
              color: value >= n && n > 0 ? 'var(--accent)' : 'var(--text3)',
            }}
          >{n}</button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', minWidth: 30 }}>
        {value}/5
      </div>
    </div>
  );
}

function BarRow({ label, val, color }) {
  const cls = val >= 65 ? 'success' : val >= 40 ? 'warning' : 'danger';
  return (
    <div className="bar-row">
      <div className="bar-meta"><span>{label}</span><span>{val}%</span></div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${val}%`, background: color || `var(--${cls})` }} />
      </div>
    </div>
  );
}

const INIT = {
  name: '', email: '', year: '', branch: '', cgpa: '',
  projects: '', internship: 'NO', certifications: 'NO',
  interested_domain: '', self_rating: 3,
  comm_rating: 0, aptitude_rating: 0, ps_rating: 0, teamwork_rating: 0, adapt_rating: 0,
  prog_rating: 0, dsa_rating: 0, webdev_rating: 0, sql_rating: 0,
  ml_rating: 0, da_rating: 0, cloud_rating: 0, cyber_rating: 0,
  dm_rating: 0, seo_rating: 0, content_rating: 0, social_rating: 0,
  uiux_rating: 0, graphic_rating: 0, video_rating: 0, creativity_rating: 0,
};

export default function Analyzer() {
  const [form, setForm]     = useState(INIT);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');
  const [activeTab, setActiveTab] = useState('core');

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAnalyze = async () => {
    if (!form.cgpa)             { setError('Please select your CGPA range.'); return; }
    if (!form.interested_domain){ setError('Please select your interested domain.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await api.quickAnalyze(form);
      setResult(res); setSaved(false);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { setError('Enter name and email to save.'); return; }
    setLoading(true);
    try {
      const student = await api.createStudent(form);
      await api.analyzeStudent(student.id);
      setSaved(true); setError('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const reset = () => { setResult(null); setSaved(false); setError(''); setForm(INIT); };

  const domainEntries = result
    ? Object.entries(result.domain_scores).sort((a, b) => b[1].pct - a[1].pct)
    : [];

  const readyColor = result?.readiness === 'Ready' ? 'var(--success)' : 'var(--danger)';

  if (result) return (
    <div>
      <div className="page-title">Analysis Result</div>
      <div className="page-sub">Based on your skill ratings and profile data.</div>

      {/* Top result card */}
      <div className="card" style={{ borderColor: readyColor, background: result.readiness === 'Ready' ? 'var(--success-dim)' : 'var(--danger-dim)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text2)', marginBottom: 6 }}>Best domain match</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: DOMAIN_COLORS[result.best_domain] || 'var(--accent)', marginBottom: 8 }}>
              {result.best_domain}
            </div>
            <span className="pill" style={{
              background: result.readiness === 'Ready' ? 'var(--success-dim)' : 'var(--danger-dim)',
              color: readyColor, border: `0.5px solid ${readyColor}`, padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600
            }}>
              {result.readiness === 'Ready' ? '✓ Placement Ready' : '✗ Not Ready Yet'}
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 700, color: readyColor, lineHeight: 1 }}>
              {result.readiness_pct}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 4 }}>Readiness Score</div>
          </div>
        </div>
      </div>

      {/* Domain scores */}
      <div className="card">
        <div className="card-title">Domain compatibility</div>
        {domainEntries.map(([domain, data]) => (
          <BarRow key={domain} label={domain} val={data.pct} color={DOMAIN_COLORS[domain]} />
        ))}
      </div>

      {/* Strengths & Gaps */}
      <div className="row2">
        <div className="card">
          <div className="card-title" style={{ color: 'var(--success)' }}>✓ Your strengths</div>
          <div className="tag-row">
            {result.strengths.length > 0
              ? result.strengths.map(s => <span key={s} className="tag tag-success">{s}</span>)
              : <span style={{ fontSize: 12, color: 'var(--text3)' }}>Rate your skills above to see strengths</span>}
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ color: 'var(--danger)' }}>✗ Skill gaps to fix</div>
          <div className="tag-row">
            {result.gaps.length > 0
              ? result.gaps.map(s => <span key={s} className="tag tag-danger">{s}</span>)
              : <span style={{ fontSize: 12, color: 'var(--success)' }}>No major gaps found!</span>}
          </div>
        </div>
      </div>

      {/* Skill breakdown per domain */}
      <div className="card">
        <div className="card-title">Skill breakdown for {result.best_domain}</div>
        {domainEntries.slice(0, 1).map(([, data]) => (
          <div key="breakdown" className="row3" style={{ gap: '1rem' }}>
            <div>
              <div className="section-label">Core avg</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>
                {(data.core_avg).toFixed(1)}<span style={{ fontSize: 14, color: 'var(--text2)' }}>/5</span>
              </div>
            </div>
            <div>
              <div className="section-label">Technical avg</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, color: 'var(--purple)' }}>
                {(data.tech_avg).toFixed(1)}<span style={{ fontSize: 14, color: 'var(--text2)' }}>/5</span>
              </div>
            </div>
            <div>
              <div className="section-label">Creative avg</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, color: 'var(--teal)' }}>
                {(data.creative_avg).toFixed(1)}<span style={{ fontSize: 14, color: 'var(--text2)' }}>/5</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action plan */}
      <div className="card">
        <div className="card-title">Action plan</div>
        {result.advice.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < result.advice.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 700, minWidth: 24 }}>0{i + 1}</span>
            <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{a}</span>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {saved && <div className="alert alert-success">Profile saved to student database!</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-success" onClick={handleSave} disabled={loading || saved}>
          {saved ? '✓ Saved' : loading ? <span className="spinner" /> : 'Save to database'}
        </button>
        <button className="btn" onClick={reset}>← Analyze again</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-title">Placement Readiness Analyzer</div>
      <div className="page-sub">Rate your skills honestly to get an accurate readiness prediction.</div>

      {/* Profile */}
      <div className="card">
        <div className="card-title">Profile</div>
        <div className="form-grid">
          <div className="field"><label>Full name</label>
            <input placeholder="e.g. Akshatha" value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div className="field"><label>Email</label>
            <input placeholder="you@college.edu" value={form.email} onChange={e => update('email', e.target.value)} />
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
              {['AIML','CSE','ISE','ECE','EEE','Mechanical','Civil','MCA','Commerce','Other'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="field"><label>CGPA</label>
            <select value={form.cgpa} onChange={e => update('cgpa', e.target.value)}>
              <option value="">Select CGPA range</option>
              {['9+','8-9','7-8','6-7','Below 6'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field"><label>Projects completed</label>
            <select value={form.projects} onChange={e => update('projects', e.target.value)}>
              <option value="">Select range</option>
              {['0','1-2','3-5','5+'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="field"><label>Interested domain</label>
            <select value={form.interested_domain} onChange={e => update('interested_domain', e.target.value)}>
              <option value="">Select domain</option>
              {['Data & AI','IT / Software','Design','Marketing'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field"><label>Self-rate readiness (1–5)</label>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => update('self_rating', n)} style={{
                  width: 36, height: 36, borderRadius: 6, border: '0.5px solid',
                  cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
                  background: form.self_rating >= n ? 'var(--warning-dim)' : 'var(--bg3)',
                  borderColor: form.self_rating >= n ? 'rgba(247,201,72,0.4)' : 'var(--border)',
                  color: form.self_rating >= n ? 'var(--warning)' : 'var(--text3)',
                }}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Internship + Certs */}
        <div className="divider" />
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div className="field" style={{ minWidth: 180 }}>
            <label>Internship experience</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {['YES','NO'].map(v => (
                <button key={v} onClick={() => update('internship', v)} style={{
                  padding: '7px 18px', borderRadius: 8, border: '0.5px solid', cursor: 'pointer',
                  fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500,
                  background: form.internship === v ? 'var(--accent-dim)' : 'var(--bg3)',
                  borderColor: form.internship === v ? 'var(--accent-border)' : 'var(--border)',
                  color: form.internship === v ? 'var(--accent)' : 'var(--text2)',
                }}>{v}</button>
              ))}
            </div>
          </div>
          <div className="field" style={{ minWidth: 180 }}>
            <label>Certifications / Courses</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {['YES','NO'].map(v => (
                <button key={v} onClick={() => update('certifications', v)} style={{
                  padding: '7px 18px', borderRadius: 8, border: '0.5px solid', cursor: 'pointer',
                  fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500,
                  background: form.certifications === v ? 'var(--accent-dim)' : 'var(--bg3)',
                  borderColor: form.certifications === v ? 'var(--accent-border)' : 'var(--border)',
                  color: form.certifications === v ? 'var(--accent)' : 'var(--text2)',
                }}>{v}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Ratings — tabbed by category */}
      <div className="card">
        <div className="card-title">Skill ratings (0 = none, 5 = expert)</div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem' }}>
          {[
            { id: 'core',     label: 'Core Skills',              color: 'var(--accent)'  },
            { id: 'technical',label: 'Technical & Data Skills',  color: 'var(--purple)'  },
            { id: 'creative', label: 'Creative & Marketing',     color: 'var(--teal)'    },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', border: '0.5px solid', fontFamily: 'var(--font)',
              background: activeTab === tab.id ? 'rgba(108,142,247,0.1)' : 'transparent',
              borderColor: activeTab === tab.id ? tab.color : 'var(--border)',
              color: activeTab === tab.id ? tab.color : 'var(--text2)',
            }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'core' && CORE_SKILLS.map(s => (
          <RatingRow key={s.key} label={s.label} fieldKey={s.key} value={form[s.key]} onChange={update} />
        ))}
        {activeTab === 'technical' && TECH_SKILLS.map(s => (
          <RatingRow key={s.key} label={s.label} fieldKey={s.key} value={form[s.key]} onChange={update} />
        ))}
        {activeTab === 'creative' && CREATIVE_SKILLS.map(s => (
          <RatingRow key={s.key} label={s.label} fieldKey={s.key} value={form[s.key]} onChange={update} />
        ))}

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
          Switch between tabs to rate all 3 skill categories for the most accurate result.
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading} style={{ width: '100%', padding: 13 }}>
        {loading ? <span className="spinner" /> : 'Analyze my placement readiness →'}
      </button>
    </div>
  );
}