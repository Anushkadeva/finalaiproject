import { useState, useEffect } from 'react';
import { api } from '../services/api';

const DOMAIN_COLORS = {
  'IT / Software': '#ff6b35',
  'Data & AI':     '#8b5cf6',
  'Design':        '#14b8a6',
  'Marketing':     '#f59e0b',
};

function readinessColor(pct) {
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#ff6b35';
  if (pct >= 40) return '#f59e0b';
  return '#ef4444';
}

function readinessLabel(pct) {
  if (pct >= 80) return 'Excellent';
  if (pct >= 60) return 'Ready';
  if (pct >= 40) return 'Needs Work';
  return 'Not Ready';
}

function BarRow({ label, val, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{label}</span>
        <span style={{ color, fontFamily: 'var(--mono)', fontWeight: 700 }}>{val}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ report, student, onClose }) {
  if (!report) return null;

  const rc = readinessColor(report.readiness_pct);
  const domainScores = report.domain_scores || {};
  const strengths = report.strengths || [];
  const gaps = report.gaps || [];
  const advice = report.advice || [];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 680,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, #1a1a2e, #16213e)`,
          borderRadius: '20px 20px 0 0', padding: '1.5rem 2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Student ID #{report.student_id}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              {student?.name || `Student #${report.student_id}`}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              {student?.email} · {student?.branch} · {student?.year}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 800, color: rc, lineHeight: 1 }}>
              {report.readiness_pct}%
            </div>
            <div style={{
              marginTop: 6, padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              background: `${rc}22`, color: rc, border: `1px solid ${rc}44`, display: 'inline-block',
            }}>
              {readinessLabel(report.readiness_pct)}
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>

          {/* Best Domain */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: `${DOMAIN_COLORS[report.best_domain] || '#ff6b35'}10`,
            border: `1px solid ${DOMAIN_COLORS[report.best_domain] || '#ff6b35'}30`,
            borderRadius: 12, marginBottom: '1.25rem',
          }}>
            <span style={{ fontSize: 22 }}>🎯</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>Best Domain Match</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: DOMAIN_COLORS[report.best_domain] || '#ff6b35' }}>{report.best_domain}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)' }}>
              Analyzed {new Date(report.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Student Profile */}
          {student && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.25rem' }}>
              {[
                ['CGPA', student.cgpa || '—'],
                ['Projects', student.projects || '—'],
                ['Internship', student.internship || '—'],
                ['Certifications', student.certifications || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: v === 'YES' ? 'var(--success)' : v === 'NO' ? 'var(--danger)' : 'var(--text)' }}>{v}</div>
                </div>
              ))}
            </div>
          )}

          {/* Domain Scores */}
          {Object.keys(domainScores).length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text3)', marginBottom: 12 }}>Domain Compatibility</div>
              {Object.entries(domainScores)
                .sort((a, b) => b[1].pct - a[1].pct)
                .map(([domain, data]) => (
                  <BarRow key={domain} label={domain} val={data.pct} color={DOMAIN_COLORS[domain] || '#ff6b35'} />
                ))}
            </div>
          )}

          {/* Strengths & Gaps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>✓ Strengths</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {strengths.length > 0
                  ? strengths.map(s => <span key={s} style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--success)', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s}</span>)
                  : <span style={{ fontSize: 12, color: 'var(--text3)' }}>No strengths recorded</span>}
              </div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>✗ Skill Gaps</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {gaps.length > 0
                  ? gaps.map(s => <span key={s} style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s}</span>)
                  : <span style={{ fontSize: 12, color: 'var(--success)' }}>No major gaps!</span>}
              </div>
            </div>
          </div>

          {/* Action Plan */}
          {advice.length > 0 && (
            <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text3)', marginBottom: 10 }}>📋 Action Plan</div>
              {advice.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < advice.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--orange)', fontWeight: 700, minWidth: 22 }}>0{i + 1}</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{a}</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem', padding: 12 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PlacementReports() {
  const [reports, setReports]   = useState([]);
  const [students, setStudents] = useState({});
  const [filters, setFilters]   = useState({ domain: '', readiness: '', dateRange: 'all' });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reps, studs] = await Promise.all([
        fetch('http://localhost:5000/api/analysis/results').then(r => r.json()),
        fetch('http://localhost:5000/api/students').then(r => r.json()),
      ]);
      setReports(Array.isArray(reps) ? reps : []);
      // Build student lookup map by id
      const map = {};
      (Array.isArray(studs) ? studs : []).forEach(s => { map[s.id] = s; });
      setStudents(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter(r => {
    if (filters.domain && r.best_domain !== filters.domain) return false;
    if (filters.readiness === 'ready' && r.readiness_pct < 60) return false;
    if (filters.readiness === 'not-ready' && r.readiness_pct >= 60) return false;
    return true;
  });

  const exportCSV = () => {
    const rows = [
      ['Student ID', 'Name', 'Best Domain', 'Readiness %', 'Status', 'Date'],
      ...filtered.map(r => [
        r.student_id,
        students[r.student_id]?.name || '—',
        r.best_domain,
        r.readiness_pct?.toFixed(1),
        readinessLabel(r.readiness_pct),
        new Date(r.created_at).toLocaleDateString(),
      ]),
    ].map(row => row.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }));
    a.download = 'placement_reports.csv';
    a.click();
  };

  const avgReadiness = filtered.length
    ? (filtered.reduce((s, r) => s + r.readiness_pct, 0) / filtered.length).toFixed(1)
    : '0';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 4, height: 26, background: 'var(--orange)', borderRadius: 99 }} />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>Placement Reports</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginLeft: 14 }}>Comprehensive readiness reports for all analyzed students</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={fetchData}>🔄 Refresh</button>
          <button className="btn btn-primary" onClick={exportCSV}>📤 Export CSV</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Reports', value: filtered.length, color: '#ff6b35', icon: '📊' },
          { label: 'Ready Students', value: filtered.filter(r => r.readiness_pct >= 60).length, color: '#22c55e', icon: '✅' },
          { label: 'Avg Readiness', value: `${avgReadiness}%`, color: '#8b5cf6', icon: '📈' },
        ].map(c => (
          <div key={c.label} className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="kpi-lbl">{c.label}</div>
                <div className="kpi-val" style={{ color: c.color }}>{c.value}</div>
              </div>
              <span style={{ fontSize: 28 }}>{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {[
            { label: 'Domain', key: 'domain', options: [['', 'All Domains'], ['Data & AI', 'Data & AI'], ['IT / Software', 'IT / Software'], ['Design', 'Design'], ['Marketing', 'Marketing']] },
            { label: 'Readiness', key: 'readiness', options: [['', 'All Students'], ['ready', 'Ready (≥60%)'], ['not-ready', 'Not Ready (<60%)']] },
          ].map(f => (
            <div key={f.key} className="field" style={{ minWidth: 160 }}>
              <label>{f.label}</label>
              <select value={filters[f.key]} onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))}>
                {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <button className="btn" onClick={() => setFilters({ domain: '', readiness: '', dateRange: 'all' })}>Clear</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Reports ({filtered.length})</div>
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div>No reports found.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Best Domain</th>
                  <th>Readiness Score</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((report, i) => {
                  const student = students[report.student_id];
                  const rc = readinessColor(report.readiness_pct);
                  const dc = DOMAIN_COLORS[report.best_domain] || '#ff6b35';
                  return (
                    <tr key={report.id}>
                      <td style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{student?.name || `Student #${report.student_id}`}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{student?.email || `ID: ${report.student_id}`}</div>
                      </td>
                      <td>
                        <span style={{ background: `${dc}15`, color: dc, padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: `1px solid ${dc}30` }}>
                          {report.best_domain}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden', minWidth: 60 }}>
                            <div style={{ height: '100%', width: `${report.readiness_pct}%`, background: rc, borderRadius: 99 }} />
                          </div>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: rc, minWidth: 40 }}>
                            {report.readiness_pct?.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: `${rc}15`, color: rc, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, border: `1px solid ${rc}30` }}>
                          {readinessLabel(report.readiness_pct)}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(report.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '5px 14px', fontSize: 12 }}
                          onClick={() => setSelected({ report, student })}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          report={selected.report}
          student={selected.student}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
