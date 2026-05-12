// src/pages/Students.jsx
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const DOMAIN_COLORS = {
  'Data & AI':     'var(--purple)',
  'IT / Software': 'var(--accent)',
  'Design':        'var(--teal)',
  'Marketing':     'var(--warning)',
};

function SkillBar({ label, val, color = 'var(--accent)' }) {
  return (
    <div className="bar-row">
      <div className="bar-meta"><span>{label}</span><span>{val}/5</span></div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${(val / 5) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Students() {
  const [students, setStudents]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [search, setSearch]       = useState('');
  const [error, setError]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setStudents(await api.getStudents()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const viewStudent = async (s) => {
    setSelected(s);
    try { setResults(await api.getResults(s.id)); }
    catch { setResults([]); }
  };

  const reAnalyze = async (id) => {
    setAnalyzing(true);
    try {
      await api.analyzeStudent(id);
      setResults(await api.getResults(id));
    } catch (e) { setError(e.message); }
    finally { setAnalyzing(false); }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    setDeleting(id);
    try {
      await api.deleteStudent(id);
      setStudents(s => s.filter(x => x.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e) { setError(e.message); }
    finally { setDeleting(null); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.branch?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.interested_domain?.toLowerCase().includes(search.toLowerCase())
  );

  const latest = results[0];

  // ── Detail view ────────────────────────────────────────────────────────────
  if (selected) {
    const { core = {}, technical = {}, creative = {} } = selected;

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <button className="btn" onClick={() => { setSelected(null); setResults([]); }}>← Back</button>
          <div>
            <div className="page-title">{selected.name}</div>
            <div className="page-sub">{selected.email} · {selected.branch} · {selected.year}</div>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-row">
          <div className="kpi-card"><div className="kpi-val">{selected.cgpa || '—'}</div><div className="kpi-lbl">CGPA</div></div>
          <div className="kpi-card"><div className="kpi-val">{selected.projects || '—'}</div><div className="kpi-lbl">Projects</div></div>
          <div className="kpi-card">
            <div className="kpi-val" style={{ color: selected.internship === 'YES' ? 'var(--success)' : 'var(--danger)' }}>
              {selected.internship}
            </div>
            <div className="kpi-lbl">Internship</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val" style={{ color: selected.certifications === 'YES' ? 'var(--success)' : 'var(--danger)' }}>
              {selected.certifications}
            </div>
            <div className="kpi-lbl">Certifications</div>
          </div>
        </div>

        {/* Profile details */}
        <div className="row2">
          <div className="card">
            <div className="card-title">Profile details</div>
            {[
              ['Interested Domain', selected.interested_domain],
              ['Self Rating', `${selected.self_rating} / 5`],
              ['Year', selected.year],
              ['Branch', selected.branch],
              ['CGPA Range', selected.cgpa],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>{k}</span>
                <span style={{ color: v && DOMAIN_COLORS[v] ? DOMAIN_COLORS[v] : 'var(--text)', fontWeight: 500 }}>{v || '—'}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title" style={{ color: 'var(--accent)' }}>Core skill ratings</div>
            {Object.entries(core).map(([skill, val]) => (
              <SkillBar key={skill} label={skill} val={val} color="var(--accent)" />
            ))}
          </div>
        </div>

        <div className="row2">
          <div className="card">
            <div className="card-title" style={{ color: 'var(--purple)' }}>Technical & Data skills</div>
            {Object.entries(technical).map(([skill, val]) => (
              <SkillBar key={skill} label={skill} val={val} color="var(--purple)" />
            ))}
          </div>
          <div className="card">
            <div className="card-title" style={{ color: 'var(--teal)' }}>Creative & Marketing skills</div>
            {Object.entries(creative).map(([skill, val]) => (
              <SkillBar key={skill} label={skill} val={val} color="var(--teal)" />
            ))}
          </div>
        </div>

        {/* Analysis result */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Latest analysis</div>
            <button className="btn btn-primary" onClick={() => reAnalyze(selected.id)} disabled={analyzing}>
              {analyzing ? <span className="spinner" /> : '⟳ Re-analyze'}
            </button>
          </div>

          {latest ? (
            <>
              <div className="kpi-row" style={{ marginBottom: '1rem' }}>
                <div className="kpi-card">
                  <div className="kpi-val" style={{ color: DOMAIN_COLORS[latest.best_domain] || 'var(--accent)', fontSize: 15 }}>
                    {latest.best_domain}
                  </div>
                  <div className="kpi-lbl">Best domain</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-val" style={{ color: latest.readiness === 'Ready' ? 'var(--success)' : 'var(--danger)' }}>
                    {latest.readiness}
                  </div>
                  <div className="kpi-lbl">Readiness</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-val" style={{ color: latest.readiness === 'Ready' ? 'var(--success)' : 'var(--danger)' }}>
                    {latest.readiness_pct}%
                  </div>
                  <div className="kpi-lbl">Score</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-val">{new Date(latest.created_at).toLocaleDateString()}</div>
                  <div className="kpi-lbl">Analyzed on</div>
                </div>
              </div>

              <div className="row2" style={{ marginBottom: '1rem' }}>
                <div>
                  <div className="section-label">Strengths</div>
                  <div className="tag-row">
                    {latest.strengths.map(s => <span key={s} className="tag tag-success">{s}</span>)}
                  </div>
                </div>
                <div>
                  <div className="section-label">Skill gaps</div>
                  <div className="tag-row">
                    {latest.gaps.map(s => <span key={s} className="tag tag-danger">{s}</span>)}
                  </div>
                </div>
              </div>

              <div className="section-label">Domain scores</div>
              {Object.entries(latest.domain_scores)
                .sort((a, b) => b[1].pct - a[1].pct)
                .map(([domain, data]) => (
                  <div key={domain} className="bar-row">
                    <div className="bar-meta"><span>{domain}</span><span>{data.pct}%</span></div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${data.pct}%`, background: DOMAIN_COLORS[domain] || 'var(--accent)' }} />
                    </div>
                  </div>
                ))}

              <div className="divider" />
              <div className="section-label">Action plan</div>
              {latest.advice.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontSize: 11, minWidth: 22 }}>0{i + 1}</span>
                  <span style={{ color: 'var(--text2)', lineHeight: 1.6 }}>{a}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">◈</div>
              No analysis yet — click Re-analyze to generate one.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-title">Student Database</div>
      <div className="page-sub">All students saved from the Analyzer.</div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', alignItems: 'center' }}>
          <div className="field" style={{ flex: 1, gap: 0 }}>
            <input placeholder="Search by name, branch, domain, or email…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
            {filtered.length} student{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⊞</div>
            {search ? 'No students match your search.' : 'No students yet — use the Analyzer to add one.'}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Branch / Year</th>
                  <th>CGPA</th>
                  <th>Domain</th>
                  <th>Internship</th>
                  <th>Certs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ color: 'var(--text)', fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.email}</div>
                    </td>
                    <td>{s.branch || '—'} · {s.year || '—'}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{s.cgpa || '—'}</td>
                    <td>
                      <span className="tag" style={{
                        background: 'transparent',
                        border: `0.5px solid ${DOMAIN_COLORS[s.interested_domain] || 'var(--border)'}`,
                        color: DOMAIN_COLORS[s.interested_domain] || 'var(--text2)',
                        padding: '3px 8px', borderRadius: 99, fontSize: 11
                      }}>
                        {s.interested_domain || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`tag ${s.internship === 'YES' ? 'tag-success' : 'tag-danger'}`}>
                        {s.internship}
                      </span>
                    </td>
                    <td>
                      <span className={`tag ${s.certifications === 'YES' ? 'tag-success' : 'tag-danger'}`}>
                        {s.certifications}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn" style={{ padding: '5px 12px', fontSize: 12 }}
                          onClick={() => viewStudent(s)}>View</button>
                        <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12 }}
                          onClick={() => deleteStudent(s.id)} disabled={deleting === s.id}>
                          {deleting === s.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}