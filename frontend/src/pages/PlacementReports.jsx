// src/pages/PlacementReports.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function PlacementReports() {
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({
    domain: '',
    readiness: '',
    dateRange: 'all'
  });

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

  const filteredReports = reports.filter(report => {
    if (filters.domain && report.best_domain !== filters.domain) return false;
    if (filters.readiness) {
      if (filters.readiness === 'ready' && report.readiness_pct < 60) return false;
      if (filters.readiness === 'not-ready' && report.readiness_pct >= 60) return false;
    }
    return true;
  });

  const exportToCSV = () => {
    const csvContent = [
      ['Student ID', 'Best Domain', 'Readiness %', 'Created Date'],
      ...filteredReports.map(report => [
        report.student_id,
        report.best_domain,
        report.readiness_pct.toFixed(1),
        new Date(report.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'placement_reports.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getReadinessColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#3b82f6';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getReadinessLabel = (percentage) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Ready';
    if (percentage >= 40) return 'Needs Work';
    return 'Not Ready';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Placement Reports</h1>
        <p>Comprehensive placement readiness reports and analytics</p>
      </div>

      <div className="reports-controls">
        <div className="filters-section">
          <h3>Filters</h3>
          <div className="filter-controls">
            <div className="filter-group">
              <label>Domain:</label>
              <select 
                value={filters.domain} 
                onChange={(e) => setFilters({...filters, domain: e.target.value})}
                className="filter-select"
              >
                <option value="">All Domains</option>
                <option value="Data & AI">Data & AI</option>
                <option value="IT / Software">IT / Software</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Readiness:</label>
              <select 
                value={filters.readiness} 
                onChange={(e) => setFilters({...filters, readiness: e.target.value})}
                className="filter-select"
              >
                <option value="">All Students</option>
                <option value="ready">Ready (≥60%)</option>
                <option value="not-ready">Not Ready (&lt;60%)</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range:</label>
              <select 
                value={filters.dateRange} 
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        <div className="actions-section">
          <button className="btn btn-primary" onClick={exportToCSV}>
            📤 Export CSV
          </button>
          <button className="btn btn-secondary" onClick={fetchReports}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="reports-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Reports</h3>
            <div className="summary-value">{filteredReports.length}</div>
          </div>
          <div className="summary-card">
            <h3>Ready Students</h3>
            <div className="summary-value" style={{ color: '#10b981' }}>
              {filteredReports.filter(r => r.readiness_pct >= 60).length}
            </div>
          </div>
          <div className="summary-card">
            <h3>Average Readiness</h3>
            <div className="summary-value">
              {filteredReports.length > 0 
                ? (filteredReports.reduce((sum, r) => sum + r.readiness_pct, 0) / filteredReports.length).toFixed(1)
                : '0'}%
            </div>
          </div>
        </div>
      </div>

      <div className="reports-table">
        <div className="table-header">
          <h3>Placement Reports ({filteredReports.length} students)</h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Best Domain</th>
                <th>Readiness Score</th>
                <th>Status</th>
                <th>Analysis Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, index) => (
                <tr key={report.id}>
                  <td>{report.student_id}</td>
                  <td>{report.best_domain}</td>
                  <td>
                    <div className="readiness-score">
                      <span style={{ color: getReadinessColor(report.readiness_pct) }}>
                        {report.readiness_pct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getReadinessColor(report.readiness_pct),
                        color: 'white'
                      }}
                    >
                      {getReadinessLabel(report.readiness_pct)}
                    </span>
                  </td>
                  <td>{new Date(report.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-outline">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          padding: 2rem;
          max-width: 1400px;
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

        .reports-controls {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        .filters-section h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }

        .filter-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
        }

        .actions-section {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
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

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-sm {
          padding: 0.25rem 0.75rem;
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

        .reports-summary {
          margin-bottom: 2rem;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .summary-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .summary-card h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .summary-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .reports-table {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-header {
          padding: 1rem 1.5rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #f9fafb;
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.875rem;
        }

        .data-table tr:hover {
          background: #f9fafb;
        }

        .readiness-score {
          font-weight: 600;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .reports-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .filter-controls {
            flex-direction: column;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .table-container {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
