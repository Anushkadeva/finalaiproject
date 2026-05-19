// src/pages/DomainStatistics.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function DomainStatistics() {
  const [domainStats, setDomainStats] = useState({});
  const [selectedDomain, setSelectedDomain] = useState('');

  useEffect(() => {
    fetchDomainStatistics();
  }, []);

  const fetchDomainStatistics = async () => {
    try {
      const response = await api.get('/analytics/domain-statistics');
      setDomainStats(response);
    } catch (error) {
      console.error('Error fetching domain statistics:', error);
    }
  };

  const domains = Object.keys(domainStats);
  const selectedStats = selectedDomain ? domainStats[selectedDomain] : null;

  const getReadinessColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#3b82f6';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Domain Statistics</h1>
        <p>Detailed statistics and performance metrics by domain</p>
      </div>

      <div className="domain-selector">
        <label>Select Domain:</label>
        <select 
          value={selectedDomain} 
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="domain-select"
        >
          <option value="">All Domains Overview</option>
          {domains.map(domain => (
            <option key={domain} value={domain}>{domain}</option>
          ))}
        </select>
      </div>

      {!selectedDomain ? (
        <div className="domains-overview">
          <h2>Domain Performance Overview</h2>
          <div className="overview-grid">
            {domains.map(domain => {
              const stats = domainStats[domain];
              return (
                <div key={domain} className="domain-card" onClick={() => setSelectedDomain(domain)}>
                  <div className="card-header">
                    <h3>{domain}</h3>
                    <div className="student-count">{stats.totalStudents} students</div>
                  </div>
                  
                  <div className="card-metrics">
                    <div className="metric">
                      <span className="metric-label">Avg Readiness</span>
                      <span 
                        className="metric-value"
                        style={{ color: getReadinessColor(stats.averageReadiness) }}
                      >
                        {stats.averageReadiness.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="metric">
                      <span className="metric-label">Ready Students</span>
                      <span className="metric-value" style={{ color: '#10b981' }}>
                        {stats.readyStudents}
                      </span>
                    </div>
                    
                    <div className="metric">
                      <span className="metric-label">Top Skill</span>
                      <span className="metric-value">{stats.topSkill}</span>
                    </div>
                  </div>

                  <div className="readiness-bar">
                    <div className="bar-background">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${stats.averageReadiness}%`,
                          backgroundColor: getReadinessColor(stats.averageReadiness)
                        }}
                      ></div>
                    </div>
                    <div className="bar-label">Readiness: {stats.averageReadiness.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="domain-details">
          <div className="details-header">
            <h2>{selectedDomain} - Detailed Statistics</h2>
            <button className="btn btn-secondary" onClick={() => setSelectedDomain('')}>
              ← Back to Overview
            </button>
          </div>

          {selectedStats && (
            <div className="details-content">
              <div className="stats-grid">
                <div className="stat-section">
                  <h3>Performance Metrics</h3>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Total Students:</span>
                      <span className="stat-value">{selectedStats.totalStudents}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Average Readiness:</span>
                      <span 
                        className="stat-value"
                        style={{ color: getReadinessColor(selectedStats.averageReadiness) }}
                      >
                        {selectedStats.averageReadiness.toFixed(1)}%
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Ready Students:</span>
                      <span className="stat-value" style={{ color: '#10b981' }}>
                        {selectedStats.readyStudents}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Not Ready Students:</span>
                      <span className="stat-value" style={{ color: '#f59e0b' }}>
                        {selectedStats.totalStudents - selectedStats.readyStudents}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="stat-section">
                  <h3>Top Skills</h3>
                  <div className="skills-ranking">
                    {selectedStats.topSkills.map((skill, index) => (
                      <div key={skill.name} className="skill-rank">
                        <div className="rank-number">#{index + 1}</div>
                        <div className="skill-info">
                          <div className="skill-name">{skill.name}</div>
                          <div className="skill-score">{skill.average.toFixed(1)}/5.0</div>
                        </div>
                        <div className="skill-bar">
                          <div 
                            className="skill-fill"
                            style={{ 
                              width: `${(skill.average / 5) * 100}%`,
                              backgroundColor: skill.average >= 4 ? '#10b981' : skill.average >= 3 ? '#3b82f6' : '#f59e0b'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stat-section">
                  <h3>Skill Distribution</h3>
                  <div className="distribution-chart">
                    {Object.entries(selectedStats.skillDistribution).map(([skill, percentage]) => (
                      <div key={skill} className="distribution-item">
                        <div className="skill-name">{skill}</div>
                        <div className="distribution-bar">
                          <div 
                            className="distribution-fill"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="percentage">{percentage.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stat-section">
                  <h3>Recent Trends</h3>
                  <div className="trend-indicators">
                    <div className="trend-item positive">
                      <div className="trend-icon">📈</div>
                      <div className="trend-info">
                        <div className="trend-label">Improvement Rate</div>
                        <div className="trend-value">+{selectedStats.improvementRate}%</div>
                      </div>
                    </div>
                    <div className="trend-item neutral">
                      <div className="trend-icon">📊</div>
                      <div className="trend-info">
                        <div className="trend-label">Growth Rate</div>
                        <div className="trend-value">{selectedStats.growthRate}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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

        .domain-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .domain-selector label {
          font-weight: 600;
          color: #374151;
        }

        .domain-select {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          min-width: 200px;
        }

        .domains-overview h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .domain-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
        }

        .domain-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .student-count {
          font-size: 0.875rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .card-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .metric {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .metric-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .readiness-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bar-background {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .bar-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          min-width: 100px;
        }

        .domain-details {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .details-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
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

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .details-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .stat-section {
          background: #f9fafb;
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
        }

        .stat-section h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .stats-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .stat-item:last-child {
          border-bottom: none;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .stat-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        .skills-ranking {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .skill-rank {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rank-number {
          width: 30px;
          height: 30px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .skill-info {
          flex: 1;
        }

        .skill-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .skill-score {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .skill-bar {
          width: 60px;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .skill-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .distribution-chart {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .distribution-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .distribution-item .skill-name {
          min-width: 120px;
          font-size: 0.875rem;
          color: #374151;
        }

        .distribution-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .distribution-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .percentage {
          min-width: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        .trend-indicators {
          display: flex;
          gap: 1rem;
        }

        .trend-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .trend-item.positive {
          border-left: 3px solid #10b981;
        }

        .trend-item.neutral {
          border-left: 3px solid #3b82f6;
        }

        .trend-icon {
          font-size: 1.5rem;
        }

        .trend-info {
          flex: 1;
        }

        .trend-label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .trend-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .details-content {
            grid-template-columns: 1fr;
          }

          .card-metrics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
