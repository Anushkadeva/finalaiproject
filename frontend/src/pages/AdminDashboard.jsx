// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    readyStudents: 0,
    notReadyStudents: 0,
    averageReadiness: 0,
    topDomain: '',
    recentAnalyses: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.getDashboardStats();
      setStats({
        totalStudents: response.total_students || 0,
        readyStudents: response.ready_count || 0,
        notReadyStudents: response.not_ready_count || 0,
        averageReadiness: response.avg_readiness_pct || 0,
        topDomain: Object.keys(response.domain_distribution || {}).reduce((a, b) => 
          (response.domain_distribution[a] || 0) > (response.domain_distribution[b] || 0) ? a : b, 'N/A'),
        recentAnalyses: response.total_analyses || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const getReadinessColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#3b82f6';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of placement readiness and system statistics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <div className="stat-value">{stats.totalStudents}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Ready for Placement</h3>
            <div className="stat-value" style={{ color: '#10b981' }}>{stats.readyStudents}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Need Improvement</h3>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.notReadyStudents}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Average Readiness</h3>
            <div className="stat-value" style={{ color: getReadinessColor(stats.averageReadiness) }}>
              {stats.averageReadiness}%
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Top Domain</h3>
            <div className="stat-value">{stats.topDomain}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Recent Analyses</h3>
            <div className="stat-value">{stats.recentAnalyses}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-card" onClick={() => window.location.reload()}>
            <div className="action-icon">🔄</div>
            <div className="action-content">
              <h3>Refresh Data</h3>
              <p>Update all dashboard statistics</p>
            </div>
          </button>

          <button 
            className="action-card" 
            onClick={() => alert('Navigate to Student Management')}
          >
            <div className="action-icon">👥</div>
            <div className="action-content">
              <h3>Manage Students</h3>
              <p>Add, edit, or remove students</p>
            </div>
          </button>

          <button 
            className="action-card" 
            onClick={() => alert('Navigate to Analytics')}
          >
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h3>View Analytics</h3>
              <p>Detailed system analytics</p>
            </div>
          </button>

          <button 
            className="action-card" 
            onClick={() => alert('Navigate to Export Reports')}
          >
            <div className="action-icon">📤</div>
            <div className="action-content">
              <h3>Export Reports</h3>
              <p>Download system reports</p>
            </div>
          </button>
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 2.5rem;
          width: 4rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 50%;
        }

        .stat-content {
          flex: 1;
        }

        .stat-content h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
        }

        .dashboard-actions {
          margin-top: 2rem;
        }

        .dashboard-actions h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .action-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 50%;
        }

        .action-content {
          flex: 1;
        }

        .action-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .action-content p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
