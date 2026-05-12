// src/pages/ExportReports.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ExportReports() {
  const [reports, setReports] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedReport, setSelectedReport] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/analysis/results');
      setReports(response);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const exportData = () => {
    let data = [];
    let filename = '';
    let contentType = '';

    switch (selectedReport) {
      case 'all':
        data = reports;
        filename = `placement_reports_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'ready':
        data = reports.filter(r => r.readiness_pct >= 60);
        filename = `ready_students_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'not-ready':
        data = reports.filter(r => r.readiness_pct < 60);
        filename = `not_ready_students_${new Date().toISOString().split('T')[0]}`;
        break;
      default:
        data = reports;
        filename = 'placement_reports';
    }

    if (exportFormat === 'csv') {
      exportToCSV(data, filename);
    } else if (exportFormat === 'json') {
      exportToJSON(data, filename);
    } else if (exportFormat === 'excel') {
      exportToExcel(data, filename);
    }
  };

  const exportToCSV = (data, filename) => {
    const headers = ['Student ID', 'Best Domain', 'Readiness %', 'Created Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(report => [
        report.student_id,
        report.best_domain,
        report.readiness_pct.toFixed(1),
        new Date(report.created_at).toLocaleDateString(),
        report.readiness_pct >= 60 ? 'Ready' : 'Not Ready'
      ].join(','))
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  };

  const exportToJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  };

  const exportToExcel = (data, filename) => {
    // Simple Excel export (CSV format that Excel can open)
    exportToCSV(data, filename);
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getReportStats = () => {
    const readyCount = reports.filter(r => r.readiness_pct >= 60).length;
    const notReadyCount = reports.length - readyCount;
    const avgReadiness = reports.length > 0 
      ? reports.reduce((sum, r) => sum + r.readiness_pct, 0) / reports.length 
      : 0;

    return {
      total: reports.length,
      ready: readyCount,
      notReady: notReadyCount,
      average: avgReadiness.toFixed(1)
    };
  };

  const stats = getReportStats();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Export Reports</h1>
        <p>Export placement and analytics reports in various formats</p>
      </div>

      <div className="export-controls">
        <div className="control-section">
          <h3>Export Options</h3>
          <div className="controls-grid">
            <div className="control-group">
              <label>Report Type:</label>
              <select 
                value={selectedReport} 
                onChange={(e) => setSelectedReport(e.target.value)}
                className="control-select"
              >
                <option value="all">All Students</option>
                <option value="ready">Ready Students Only</option>
                <option value="not-ready">Not Ready Students Only</option>
              </select>
            </div>

            <div className="control-group">
              <label>Export Format:</label>
              <select 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value)}
                className="control-select"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="excel">Excel</option>
              </select>
            </div>

            <div className="control-group">
              <label>&nbsp;</label>
              <button className="btn btn-primary" onClick={exportData}>
                📤 Export Now
              </button>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h3>Current Data Overview</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Total Reports</div>
                <div className="stat-value">{stats.total}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">Ready Students</div>
                <div className="stat-value" style={{ color: '#10b981' }}>{stats.ready}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-label">Not Ready</div>
                <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.notReady}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-label">Average Readiness</div>
                <div className="stat-value">{stats.average}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="export-history">
        <h3>Export History</h3>
        <div className="history-list">
          <div className="history-item">
            <div className="history-info">
              <div className="history-title">Full Report Export</div>
              <div className="history-date">Last exported: Never</div>
            </div>
            <div className="history-actions">
              <button className="btn btn-sm btn-outline">
                🔄 Re-export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="export-tips">
        <h3>Export Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">📄</div>
            <div className="tip-content">
              <h4>CSV Format</h4>
              <p>Best for importing into Excel or other spreadsheet applications</p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon">🔧</div>
            <div className="tip-content">
              <h4>JSON Format</h4>
              <p>Ideal for programmatic processing and API integration</p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon">📊</div>
            <div className="tip-content">
              <h4>Excel Format</h4>
              <p>Directly opens in Microsoft Excel with proper formatting</p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon">🔄</div>
            <div className="tip-content">
              <h4>Regular Exports</h4>
              <p>Export regularly to maintain backup of placement data</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .export-controls {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .control-section h3,
        .stats-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .control-select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
        }

        .btn-outline {
          background: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }

        .btn-outline:hover {
          background: #f9fafb;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 50%;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .export-history {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .export-history h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .history-info {
          flex: 1;
        }

        .history-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 1rem;
        }

        .history-date {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .history-actions {
          display: flex;
          gap: 0.5rem;
        }

        .export-tips {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .export-tips h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .tip-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .tip-icon {
          font-size: 1.5rem;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .tip-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .tip-content p {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .export-controls {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .tips-grid {
            grid-template-columns: 1fr;
          }

          .history-item {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
