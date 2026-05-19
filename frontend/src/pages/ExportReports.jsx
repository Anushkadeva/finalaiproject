import { useState, useEffect } from 'react';

export default function ExportReports() {
  const [reports,        setReports]        = useState([]);
  const [exportFormat,   setExportFormat]   = useState('csv');
  const [selectedReport, setSelectedReport] = useState('all');
  const [exporting,      setExporting]      = useState(false);
  const [lastExport,     setLastExport]     = useState(null);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/analysis/results');
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const getFilteredData = () => {
    if (selectedReport === 'ready')     return reports.filter(r => r.readiness_pct >= 60);
    if (selectedReport === 'not-ready') return reports.filter(r => r.readiness_pct < 60);
    return reports;
  };

  const exportData = () => {
    setExporting(true);
    const data = getFilteredData();
    const date = new Date().toISOString().split('T')[0];
    const filename = `placeai_${selectedReport}_${date}`;

    if (exportFormat === 'json') {
      downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
    } else {
      const rows = [
        ['Student ID', 'Best Domain', 'Readiness %', 'Status', 'Date'],
        ...data.map(r => [
          r.student_id, r.best_domain,
          r.readiness_pct?.toFixed(1),
          r.readiness_pct >= 60 ? 'Ready' : 'Not Ready',
          new Date(r.created_at).toLocaleDateString(),
        ]),
      ].map(row => row.join(',')).join('\n');
      downloadFile(rows, `${filename}.csv`, 'text/csv');
    }

    setLastExport(new Date().toLocaleString());
    setTimeout(() => setExporting(false), 800);
  };

  const downloadFile = (content, filename, type) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename;
    a.click();
  };

  const stats = {
    total:    reports.length,
    ready:    reports.filter(r => r.readiness_pct >= 60).length,
    notReady: reports.filter(r => r.readiness_pct < 60).length,
    avg:      reports.length ? (reports.reduce((s, r) => s + r.readiness_pct, 0) / reports.length).toFixed(1) : '0',
  };

  const REPORT_TYPES = [
    { value: 'all',       label: 'All Students',         icon: '👥', count: stats.total,    color: '#ff6b35' },
    { value: 'ready',     label: 'Ready Students Only',  icon: '✅', count: stats.ready,    color: '#22c55e' },
    { value: 'not-ready', label: 'Not Ready Students',   icon: '⚠️', count: stats.notReady, color: '#ef4444' },
  ];

  const FORMATS = [
    { value: 'csv',  label: 'CSV',  icon: '📄', desc: 'Best for Excel & spreadsheets' },
    { value: 'json', label: 'JSON', icon: '🔧', desc: 'Ideal for API integration' },
  ];

  const TIPS = [
    { icon: '📄', title: 'CSV Format',       desc: 'Best for importing into Excel or Google Sheets' },
    { icon: '🔧', title: 'JSON Format',      desc: 'Ideal for programmatic processing and APIs' },
    { icon: '🔄', title: 'Regular Exports',  desc: 'Export regularly to maintain data backups' },
    { icon: '🎯', title: 'Filter First',     desc: 'Use report type filters to export targeted data' },
  ];

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 4, height: 26, background: 'var(--orange)', borderRadius: 99 }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>Export Reports</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginLeft: 14 }}>Export placement and analytics data in various formats</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: '2rem' }}>
        {[
          { label: 'Total Reports',    value: stats.total,    color: '#ff6b35', icon: '📊' },
          { label: 'Ready Students',   value: stats.ready,    color: '#22c55e', icon: '✅' },
          { label: 'Not Ready',        value: stats.notReady, color: '#ef4444', icon: '⚠️' },
          { label: 'Avg Readiness',    value: `${stats.avg}%`, color: '#8b5cf6', icon: '📈' },
        ].map(c => (
          <div key={c.label} className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="kpi-lbl">{c.label}</div>
                <div className="kpi-val" style={{ color: c.color, fontSize: 26 }}>{c.value}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {c.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Export Options */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📤</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Export Options</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Choose what to export</div>
            </div>
          </div>

          {/* Report Type Cards */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="section-label">Report Type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {REPORT_TYPES.map(t => (
                <div key={t.value}
                  onClick={() => setSelectedReport(t.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedReport === t.value ? `${t.color}10` : 'var(--bg3)',
                    border: `1.5px solid ${selectedReport === t.value ? t.color + '40' : 'transparent'}`,
                  }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: selectedReport === t.value ? t.color : 'var(--text)' }}>{t.label}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: t.color }}>{t.count}</span>
                  {selectedReport === t.value && (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Format Cards */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="section-label">Export Format</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {FORMATS.map(f => (
                <div key={f.value}
                  onClick={() => setExportFormat(f.value)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer',
                    textAlign: 'center', transition: 'all 0.2s',
                    background: exportFormat === f.value ? 'var(--orange-dim)' : 'var(--bg3)',
                    border: `1.5px solid ${exportFormat === f.value ? 'var(--orange-border)' : 'transparent'}`,
                  }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: exportFormat === f.value ? 'var(--orange)' : 'var(--text)' }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <button
            className="btn btn-primary"
            onClick={exportData}
            disabled={exporting || reports.length === 0}
            style={{ width: '100%', padding: '13px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {exporting ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Exporting...</> : `📤 Export ${getFilteredData().length} Records as ${exportFormat.toUpperCase()}`}
          </button>

          {lastExport && (
            <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: 'var(--success)' }}>
              ✓ Last exported: {lastExport}
            </div>
          )}
        </div>

        {/* Tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ margin: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: '1rem' }}>💡 Export Tips</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIPS.map(t => (
                <div key={t.title} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {t.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
            Preview — {getFilteredData().length} records selected
          </div>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Showing first 5</span>
        </div>
        {getFilteredData().length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div>No data to preview</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Best Domain</th>
                  <th>Readiness %</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredData().slice(0, 5).map(r => {
                  const rc = r.readiness_pct >= 60 ? '#22c55e' : '#ef4444';
                  return (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>#{r.student_id}</td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange)' }}>{r.best_domain}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: rc }}>{r.readiness_pct?.toFixed(1)}%</span>
                      </td>
                      <td>
                        <span style={{ background: `${rc}15`, color: rc, padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                          {r.readiness_pct >= 60 ? 'Ready' : 'Not Ready'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
