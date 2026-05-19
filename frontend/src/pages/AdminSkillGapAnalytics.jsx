// src/pages/AdminSkillGapAnalytics.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AdminSkillGapAnalytics() {
  const [skillGaps, setSkillGaps] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');

  useEffect(() => {
    fetchSkillGaps();
  }, []);

  const fetchSkillGaps = async () => {
    try {
      const response = await api.get('/analytics/skill-gaps');
      setSkillGaps(response);
    } catch (error) {
      console.error('Error fetching skill gaps:', error);
    }
  };

  const filteredGaps = skillGaps.filter(gap => 
    !selectedDomain || gap.domain === selectedDomain
  );

  const getGapSeverity = (gap) => {
    if (gap.average <= 1.5) return { color: '#ef4444', label: 'Critical' };
    if (gap.average <= 2.5) return { color: '#f59e0b', label: 'High' };
    if (gap.average <= 3.5) return { color: '#3b82f6', label: 'Medium' };
    return { color: '#10b981', label: 'Low' };
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Skill Gap Analytics</h1>
        <p>Identify and analyze skill gaps across different domains</p>
      </div>

      <div className="analytics-controls">
        <div className="control-group">
          <label>Filter by Domain:</label>
          <select 
            value={selectedDomain} 
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="domain-select"
          >
            <option value="">All Domains</option>
            <option value="Data & AI">Data & AI</option>
            <option value="IT / Software">IT / Software</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={fetchSkillGaps}>
          🔄 Refresh Data
        </button>
      </div>

      <div className="gaps-overview">
        <div className="overview-cards">
          <div className="overview-card critical">
            <div className="card-icon">🚨</div>
            <div className="card-content">
              <h3>Critical Gaps</h3>
              <div className="card-value">
                {filteredGaps.filter(g => g.average <= 1.5).length}
              </div>
            </div>
          </div>

          <div className="overview-card high">
            <div className="card-icon">⚠️</div>
            <div className="card-content">
              <h3>High Priority</h3>
              <div className="card-value">
                {filteredGaps.filter(g => g.average > 1.5 && g.average <= 2.5).length}
              </div>
            </div>
          </div>

          <div className="overview-card medium">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Medium Priority</h3>
              <div className="card-value">
                {filteredGaps.filter(g => g.average > 2.5 && g.average <= 3.5).length}
              </div>
            </div>
          </div>

          <div className="overview-card low">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h3>Low Priority</h3>
              <div className="card-value">
                {filteredGaps.filter(g => g.average > 3.5).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gaps-detailed">
        <h2>Detailed Skill Gap Analysis</h2>
        <div className="gaps-grid">
          {filteredGaps.map((gap, index) => {
            const severity = getGapSeverity(gap);
            return (
              <div key={index} className="gap-card">
                <div className="gap-header">
                  <h3>{gap.skill}</h3>
                  <span 
                    className="severity-badge"
                    style={{ backgroundColor: severity.color }}
                  >
                    {severity.label}
                  </span>
                </div>

                <div className="gap-metrics">
                  <div className="metric">
                    <span className="metric-label">Domain:</span>
                    <span className="metric-value">{gap.domain}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Average Score:</span>
                    <span className="metric-value">{gap.average.toFixed(1)}/5.0</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Students Below 3.0:</span>
                    <span className="metric-value">{gap.studentsBelow3}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Total Students:</span>
                    <span className="metric-value">{gap.totalStudents}</span>
                  </div>
                </div>

                <div className="gap-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(gap.average / 5) * 100}%`,
                        backgroundColor: severity.color
                      }}
                    ></div>
                  </div>
                  <div className="progress-label">{gap.average.toFixed(1)}/5.0</div>
                </div>

                <div className="gap-recommendations">
                  <h4>Recommended Actions:</h4>
                  <ul>
                    <li>Organize skill-specific workshops</li>
                    <li>Provide additional learning resources</li>
                    <li>Assign peer mentoring programs</li>
                    <li>Schedule regular assessments</li>
                  </ul>
                </div>
              </div>
            );
          })}
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

        .analytics-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
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

        .domain-select {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          min-width: 200px;
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

        .gaps-overview {
          margin-bottom: 3rem;
        }

        .overview-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .overview-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .overview-card.critical {
          border-left: 4px solid #ef4444;
        }

        .overview-card.high {
          border-left: 4px solid #f59e0b;
        }

        .overview-card.medium {
          border-left: 4px solid #3b82f6;
        }

        .overview-card.low {
          border-left: 4px solid #10b981;
        }

        .card-icon {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 50%;
        }

        .card-content h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .gaps-detailed h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .gaps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .gap-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .gap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .gap-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .severity-badge {
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .gap-metrics {
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
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        .gap-progress {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .progress-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
          min-width: 50px;
        }

        .gap-recommendations {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .gap-recommendations h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .gap-recommendations ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .gap-recommendations li {
          padding: 0.25rem 0;
          font-size: 0.875rem;
          color: #374151;
          position: relative;
          padding-left: 1rem;
        }

        .gap-recommendations li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #3b82f6;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .analytics-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .overview-cards {
            grid-template-columns: 1fr;
          }

          .gaps-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
