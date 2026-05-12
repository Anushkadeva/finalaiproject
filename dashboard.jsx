// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

// ── Real survey data from your dataset ────────────────────────────────────────
const SURVEY = {
  total: 103,
  year: { '1st': 13, '2nd': 48, '3rd': 30, '4th': 12 },
  cgpa: { '9+': 28, '8-9': 38, '7-8': 21, '6-7': 9, 'Below 6': 7 },
  branch: { 'AIML': 28, 'ISE': 18, 'CSE': 17, 'ECE': 12, 'EEE': 5, 'Mechanical': 8, 'Civil': 5, 'Other': 10 },
  domains: { 'IT / Software': 48, 'Data & AI': 34, 'Design': 13, 'Marketing': 8 },
  readiness: { 'Ready': 42, 'Not Ready': 61 },
  projects: { '0': 8, '1-2': 47, '3-5': 28, '5+': 20 },
  internship: { 'YES': 28, 'NO': 75 },
  certifications: { 'YES': 78, 'NO': 25 },
  // Avg skill ratings per category (0-5 scale)
  core_avgs: {
    'Communication': 2.9, 'Aptitude': 2.6, 'Problem Solving': 2.8,
    'Teamwork': 3.1, 'Adaptability': 3.0,
  },
  tech_avgs: {
    'Programming': 2.8, 'DSA': 1.9, 'Web Development': 1.8,
    'SQL': 1.7, 'ML': 1.6, 'Data Analysis': 1.5,
    'Cloud/DevOps': 1.4, 'Cybersecurity': 1.3,
  },
  creative_avgs: {
    'Digital Marketing': 1.8, 'SEO': 1.4, 'Content Writing': 1.9,
    'Social Media': 2.0, 'UI/UX Design': 1.7, 'Graphic Design': 1.8,
    'Video Editing': 1.6, 'Creativity': 2.8,
  },
};

const DOMAIN_COLORS = {
  'Data & AI':     '#7F77DD',
  'IT / Software': '#6c8ef7',
  'Design':        '#3dd6c4',
  'Marketing':     '#f7c948',
};

const BAR_COLORS = ['#6c8ef7','#3dd6c4','#7F77DD','#f7c948','#f76c6c','#3dd68c','#888780','#BA7517'];

// ── Sub-components ────────────────────────────────────────────────────────────
function BarChart({ data, total, colors = BAR_COLORS, maxBar = 100 }) {
  return (
    <div>
      {Object.entries(data).map(([k, v], i) => {
        const pct = total ? Math.round((v / total) * 100) : v;
        return (
          <div key={k} className="bar-row">
            <div className="bar-meta">
              <span>{k}</span>
              <span>{total ? `${v} (${pct}%)` : `${v}%`}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill"
                style={{ width: `${Math.min(pct, maxBar)}%`, background: colors[i % colors.length] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RingChart({ pct, color, label }) {
  const r = 32, circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="var(--bg3)" strokeWidth="8" />
        <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 42 42)" />
        <text x="42" y="47" textAnchor="middle" fontSize="13" fontWeight="700"
          fontFamily="Space Mono, monospace" fill={color}>{pct}%</text>
      </svg>
      <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>{label}</div>
    </div>
  );
}

function SkillHeatRow({ label, val, color }) {
  const pct = (val / 5) * 100;
  const textColor = val >= 3 ? 'var(--success)' : val >= 2 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="bar-row">
      <div className="bar-meta">
        <span>{label}</span>
        <span style={{ color: textColor }}>{val}/5</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [dbStats, setDbStats] = useState(null);
  const [tab, setTab] = useState('survey');

  useEffect(() => {
    api.getDashboardStats().then(setDbStats).catch(() => {});
  }, []);

  const readyPct  = Math.round((SURVEY.readiness['Ready'] / SURVEY.total) * 100);
  const internPct = Math.round((SURVEY.internship['YES'] / SURVEY.total) * 100);
  const certPct   = Math.round((SURVEY.certifications['YES'] / SURVEY.total) * 100);

  const TABS = [
    { id: 'survey',   label: `Survey Data (${SURVEY.total} students)` },
    { id: 'skills',   label: 'Skill Analysis' },
    { id: 'live',     label: `Live DB${dbStats ? ` (${dbStats.total_students})` : ''}` },
  ];

  return (
    <div>
      <div className="page-title">Analytics Dashboard</div>
      <div className="page-sub">Survey insights from {SURVEY.total} students + live database stats.</div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id}
            className={`btn ${tab === t.id ? 'btn-primary' : ''}`}
            onClick={() => setTab(t.id)}
            style={{ fontSize: 12 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SURVEY TAB ─────────────────────────────────────────────────────── */}
      {tab === 'survey' && (
        <>
          {/* KPIs */}
          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-val">{SURVEY.total}</div>
              <div className="kpi-lbl">Respondents</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: 'var(--success)' }}>{readyPct}%</div>
              <div className="kpi-lbl">Placement ready</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: 'var(--warning)' }}>{internPct}%</div>
              <div className="kpi-lbl">Have internship</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: 'var(--accent)' }}>{certPct}%</div>
              <div className="kpi-lbl">Have certifications</div>
            </div>
          </div>

          {/* Readiness rings */}
          <div className="card">
            <div className="card-title">Overall readiness snapshot</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0', flexWrap: 'wrap', gap: 16 }}>
              <RingChart pct={readyPct}  color="var(--success)" label="Ready" />
              <RingChart pct={internPct} color="var(--warning)" label="Internship" />
              <RingChart pct={certPct}   color="var(--accent)"  label="Certifications" />
              <RingChart pct={Math.round(((SURVEY.projects['3-5'] + SURVEY.projects['5+']) / SURVEY.total) * 100)}
                color="var(--purple)" label="3+ Projects" />
            </div>
          </div>

          {/* Year + CGPA */}
          <div className="row2">
            <div className="card">
              <div className="card-title">Year distribution</div>
              <BarChart data={SURVEY.year} total={SURVEY.total} />
            </div>
            <div className="card">
              <div className="card-title">CGPA range</div>
              <BarChart data={SURVEY.cgpa} total={SURVEY.total}
                colors={['var(--success)','var(--accent)','var(--warning)','var(--danger)','var(--text3)']} />
            </div>
          </div>

          {/* Branch */}
          <div className="card">
            <div className="card-title">Branch distribution</div>
            <BarChart data={SURVEY.branch} total={SURVEY.total} />
          </div>

          {/* Domain + Readiness */}
          <div className="row2">
            <div className="card">
              <div className="card-title">Interested domain</div>
              {Object.entries(SURVEY.domains).map(([domain, count], i) => {
                const pct = Math.round((count / SURVEY.total) * 100);
                return (
                  <div key={domain} className="bar-row">
                    <div className="bar-meta"><span>{domain}</span><span>{count} ({pct}%)</span></div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: Object.values(DOMAIN_COLORS)[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="card">
              <div className="card-title">Placement readiness</div>
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '1rem 0' }}>
                <RingChart pct={readyPct} color="var(--success)" label="Ready" />
                <RingChart pct={100 - readyPct} color="var(--danger)" label="Not Ready" />
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--danger-dim)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--danger)', border: '0.5px solid rgba(247,108,108,0.2)', marginTop: 8 }}>
                ⚠ {SURVEY.readiness['Not Ready']} out of {SURVEY.total} students ({100 - readyPct}%) are not yet ready for placement.
              </div>
            </div>
          </div>

          {/* Projects + Internship */}
          <div className="row2">
            <div className="card">
              <div className="card-title">Projects completed</div>
              <BarChart data={SURVEY.projects} total={SURVEY.total}
                colors={['var(--danger)','var(--warning)','var(--accent)','var(--success)']} />
            </div>
            <div className="card">
              <div className="card-title">Internship experience</div>
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '1rem 0' }}>
                <RingChart pct={internPct} color="var(--success)" label="Have Internship" />
                <RingChart pct={100 - internPct} color="var(--danger)" label="No Internship" />
              </div>
            </div>
          </div>

          {/* Key insights */}
          <div className="card">
            <div className="card-title">Key insights from survey</div>
            {[
              { icon: '⚠', color: 'var(--danger-dim)',   border: 'rgba(247,108,108,0.2)',  text: `${100 - readyPct}% of students are NOT placement ready — the biggest challenge identified.` },
              { icon: '📊', color: 'var(--warning-dim)',  border: 'rgba(247,201,72,0.2)',   text: `IT / Software is the most preferred domain (${Math.round((SURVEY.domains['IT / Software']/SURVEY.total)*100)}%), but DSA and Web Dev ratings are very low.` },
              { icon: '🎓', color: 'var(--accent-dim)',   border: 'var(--accent-border)',   text: `${certPct}% have certifications but only ${internPct}% have internship experience — practical exposure is critically low.` },
              { icon: '📁', color: 'var(--success-dim)',  border: 'rgba(61,214,140,0.2)',   text: `${Math.round(((SURVEY.projects['0'] + SURVEY.projects['1-2'])/SURVEY.total)*100)}% have 0–2 projects. More hands-on projects needed across all branches.` },
              { icon: '🧠', color: 'var(--purple)',       border: 'rgba(127,119,221,0.2)',  text: `Data & AI is the 2nd most preferred domain, yet ML and Data Analysis are the weakest technical skills on average.` },
            ].map((ins, i) => (
              <div key={i} style={{
                padding: '10px 14px', background: ins.color, borderRadius: 'var(--radius)',
                border: `0.5px solid ${ins.border}`, fontSize: 13,
                color: 'var(--text)', marginBottom: 8, lineHeight: 1.6
              }}>
                {ins.icon} {ins.text}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── SKILL ANALYSIS TAB ─────────────────────────────────────────────── */}
      {tab === 'skills' && (
        <>
          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: 'var(--success)' }}>3.0</div>
              <div className="kpi-lbl">Core avg</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: 'var(--danger)' }}>1.8</div>
              <div className="kpi-lbl">Technical avg</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: 'var(--teal)' }}>1.9</div>
              <div className="kpi-lbl">Creative avg</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: 'var(--warning)' }}>1.3</div>
              <div className="kpi-lbl">Weakest (Cybersecurity)</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ color: 'var(--accent)' }}>Core skills — average ratings</div>
            {Object.entries(SURVEY.core_avgs).map(([skill, avg]) => (
              <SkillHeatRow key={skill} label={skill} val={avg} color="var(--accent)" />
            ))}
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              Teamwork (3.1) and Adaptability (3.0) are the strongest core skills. Aptitude (2.6) is the weakest.
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ color: 'var(--purple)' }}>Technical & Data skills — average ratings</div>
            {Object.entries(SURVEY.tech_avgs).map(([skill, avg]) => (
              <SkillHeatRow key={skill} label={skill} val={avg} color="var(--purple)" />
            ))}
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--danger-dim)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--danger)', border: '0.5px solid rgba(247,108,108,0.2)' }}>
              ⚠ All technical skills average below 3/5. DSA (1.9), ML (1.6), Cloud/DevOps (1.4), and Cybersecurity (1.3) are critically low — especially for IT / Software and Data & AI goals.
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ color: 'var(--teal)' }}>Creative & Marketing skills — average ratings</div>
            {Object.entries(SURVEY.creative_avgs).map(([skill, avg]) => (
              <SkillHeatRow key={skill} label={skill} val={avg} color="var(--teal)" />
            ))}
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              Creativity (2.8) and Social Media (2.0) are strongest. SEO (1.4) is weakest in this category.
            </div>
          </div>

          {/* Domain-wise skill requirement gaps */}
          <div className="card">
            <div className="card-title">Domain vs skill gap analysis</div>
            {[
              { domain: 'Data & AI',     needed: ['Programming','DSA','ML','Data Analysis','SQL'],       avgs: [2.8,1.9,1.6,1.5,1.7], color: '#7F77DD' },
              { domain: 'IT / Software', needed: ['Programming','DSA','Web Development','SQL','Cloud/DevOps'], avgs: [2.8,1.9,1.8,1.7,1.4], color: '#6c8ef7' },
              { domain: 'Design',        needed: ['UI/UX Design','Graphic Design','Creativity','Content Writing'], avgs: [1.7,1.8,2.8,1.9], color: '#3dd6c4' },
              { domain: 'Marketing',     needed: ['Digital Marketing','SEO','Content Writing','Social Media'], avgs: [1.8,1.4,1.9,2.0], color: '#f7c948' },
            ].map(({ domain, needed, avgs, color }) => (
              <div key={domain} style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color, marginBottom: 8 }}>{domain}</div>
                {needed.map((skill, i) => (
                  <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ minWidth: 160, fontSize: 12, color: 'var(--text2)' }}>{skill}</div>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(avgs[i] / 5) * 100}%`, background: color, borderRadius: 99 }} />
                    </div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: avgs[i] < 2 ? 'var(--danger)' : avgs[i] < 3 ? 'var(--warning)' : 'var(--success)', minWidth: 32 }}>
                      {avgs[i]}/5
                    </div>
                    {avgs[i] < 2 && <span style={{ fontSize: 10, color: 'var(--danger)' }}>critical gap</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── LIVE DB TAB ────────────────────────────────────────────────────── */}
      {tab === 'live' && (
        <>
          {!dbStats || dbStats.total_students === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">◉</div>
                No students in the live database yet.<br />
                Use the Analyzer to add and save student profiles.
              </div>
            </div>
          ) : (
            <>
              <div className="kpi-row">
                <div className="kpi-card">
                  <div className="kpi-val">{dbStats.total_students}</div>
                  <div className="kpi-lbl">Students</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-val">{dbStats.total_analyses}</div>
                  <div className="kpi-lbl">Analyses run</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-val" style={{ color: 'var(--success)' }}>{dbStats.ready_count}</div>
                  <div className="kpi-lbl">Ready</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-val" style={{ color: 'var(--danger)' }}>{dbStats.not_ready_count}</div>
                  <div className="kpi-lbl">Not Ready</div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Readiness snapshot — live DB</div>
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0.75rem 0', flexWrap: 'wrap', gap: 16 }}>
                  <RingChart
                    pct={dbStats.total_analyses > 0 ? Math.round((dbStats.ready_count / dbStats.total_analyses) * 100) : 0}
                    color="var(--success)" label="Ready" />
                  <RingChart pct={dbStats.internship_pct} color="var(--warning)" label="Internship" />
                  <RingChart pct={dbStats.certification_pct} color="var(--accent)" label="Certifications" />
                  <RingChart pct={dbStats.avg_readiness_pct} color="var(--purple)" label="Avg Score" />
                </div>
              </div>

              {Object.keys(dbStats.domain_distribution).length > 0 && (
                <div className="card">
                  <div className="card-title">Domain distribution — live DB</div>
                  {Object.entries(dbStats.domain_distribution)
                    .sort((a, b) => b[1] - a[1])
                    .map(([domain, count]) => (
                      <div key={domain} className="bar-row">
                        <div className="bar-meta"><span>{domain}</span><span>{count}</span></div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{
                            width: `${(count / dbStats.total_analyses) * 100}%`,
                            background: DOMAIN_COLORS[domain] || 'var(--accent)'
                          }} />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}