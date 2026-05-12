// src/pages/ProgressTracking.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ProgressTracking() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchProgressData = async (studentId) => {
    setLoading(true);
    try {
      const response = await api.get(`/progress/${studentId}`);
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    if (studentId) {
      fetchProgressData(studentId);
    } else {
      setProgressData(null);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return '#10b981';
      case 'declining': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderProgressChart = () => {
    if (!progressData || !progressData.progress_data || progressData.progress_data.length < 2) {
      return (
        <div className="no-chart">
          <p>Insufficient data for progress tracking</p>
          <p>Need at least 2 analysis results to show progress</p>
        </div>
      );
    }

    const data = progressData.progress_data;
    const maxScore = Math.max(...data.map(d => d.readiness_score));
    const minScore = Math.min(...data.map(d => d.readiness_score));

    return (
      <div className="progress-chart">
        <div className="chart-header">
          <h3>Readiness Score Progress</h3>
          <div className="trend-indicator">
            <span className="trend-icon">{getTrendIcon(progressData.trend_analysis.trend)}</span>
            <span 
              className="trend-text" 
              style={{ color: getTrendColor(progressData.trend_analysis.trend) }}
            >
              {progressData.trend_analysis.trend.charAt(0).toUpperCase() + progressData.trend_analysis.trend.slice(1)}
            </span>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-grid">
            {data.map((point, index) => (
              <div key={index} className="chart-point">
                <div className="point-info">
                  <div className="point-date">
                    {new Date(point.date).toLocaleDateString()}
                  </div>
                  <div className="point-score">{point.readiness_score.toFixed(1)}%</div>
                </div>
                <div className="point-bar">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      height: `${((point.readiness_score - minScore) / (maxScore - minScore)) * 100}%`,
                      backgroundColor: point.readiness_score >= 60 ? '#10b981' : point.readiness_score >= 40 ? '#3b82f6' : '#f59e0b'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-summary">
          <div className="summary-item">
            <span>Total Improvement:</span>
            <span className="summary-value">
              {progressData.trend_analysis.improvement > 0 ? '+' : ''}{progressData.trend_analysis.improvement.toFixed(1)}%
            </span>
          </div>
          <div className="summary-item">
            <span>Data Points:</span>
            <span className="summary-value">{progressData.trend_analysis.data_points}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSkillProgress = () => {
    if (!progressData || !progressData.skill_progress) {
      return null;
    }

    const skills = Object.entries(progressData.skill_progress);
    const sortedSkills = skills.sort((a, b) => b[1] - a[1]);

    return (
      <div className="skill-progress">
        <h3>Current Skill Levels</h3>
        <div className="skills-grid">
          {sortedSkills.slice(0, 12).map(([skill, level]) => (
            <div key={skill} className="skill-item">
              <div className="skill-info">
                <span className="skill-name">{skill}</span>
                <span className="skill-level">{level}/5</span>
              </div>
              <div className="skill-bar">
                <div 
                  className="skill-bar-fill" 
                  style={{ 
                    width: `${(level / 5) * 100}%`,
                    backgroundColor: level >= 4 ? '#10b981' : level >= 3 ? '#3b82f6' : level >= 2 ? '#f59e0b' : '#ef4444'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Progress Tracking</h1>
        <p>Monitor student readiness trends and skill improvement over time</p>
      </div>

      <div className="content-card">
        <div className="form-section">
          <div className="form-group">
            <label>Select Student:</label>
            <select 
              value={selectedStudent} 
              onChange={handleStudentChange}
              className="form-select"
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.interested_domain}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing progress data...</p>
          </div>
        )}

        {progressData && !loading && (
          <div className="progress-results">
            <div className="progress-overview">
              <div className="overview-cards">
                <div className="overview-card">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <h3>Current Readiness</h3>
                    <div className="card-value">
                      {progressData.progress_data.length > 0 
                        ? `${progressData.progress_data[progressData.progress_data.length - 1].readiness_score.toFixed(1)}%`
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="card-icon">📈</div>
                  <div className="card-content">
                    <h3>Trend</h3>
                    <div className="card-value">
                      <span style={{ color: getTrendColor(progressData.trend_analysis.trend) }}>
                        {getTrendIcon(progressData.trend_analysis.trend)} {progressData.trend_analysis.trend}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="card-icon">🎯</div>
                  <div className="card-content">
                    <h3>Improvement</h3>
                    <div className="card-value">
                      {progressData.trend_analysis.improvement > 0 ? '+' : ''}{progressData.trend_analysis.improvement.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="card-icon">📅</div>
                  <div className="card-content">
                    <h3>Analysis Count</h3>
                    <div className="card-value">{progressData.trend_analysis.data_points}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="progress-sections">
              <div className="progress-section">
                {renderProgressChart()}
              </div>

              <div className="progress-section">
                {renderSkillProgress()}
              </div>
            </div>

            {progressData.progress_data && progressData.progress_data.length > 1 && (
              <div className="domain-progress">
                <h3>Domain Progress Over Time</h3>
                <div className="domain-timeline">
                  {progressData.progress_data.map((point, index) => (
                    <div key={index} className="timeline-point">
                      <div className="timeline-date">
                        {new Date(point.date).toLocaleDateString()}
                      </div>
                      <div className="timeline-domains">
                        {Object.entries(point.domain_scores || {}).map(([domain, scores]) => (
                          <div key={domain} className="domain-score">
                            <span className="domain-name">{domain}</span>
                            <span className="domain-percentage">{scores.pct.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedStudent && !progressData && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Progress Data Available</h3>
            <p>Student needs at least 2 analysis results to track progress</p>
          </div>
        )}
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

        .content-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
        }

        .form-select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .progress-results h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .progress-overview {
          margin-bottom: 2rem;
        }

        .overview-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .overview-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .card-icon {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
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

        .progress-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .progress-section {
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .progress-chart {
          height: 100%;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .trend-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .trend-icon {
          font-size: 1.5rem;
        }

        .trend-text {
          font-weight: 600;
        }

        .chart-container {
          margin-bottom: 1rem;
        }

        .chart-grid {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          height: 200px;
          padding: 1rem 0;
        }

        .chart-point {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .point-info {
          text-align: center;
        }

        .point-date {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .point-score {
          font-weight: 600;
          color: #1f2937;
        }

        .point-bar {
          width: 20px;
          height: 100px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .bar-fill {
          position: absolute;
          bottom: 0;
          width: 100%;
          transition: height 0.3s ease;
        }

        .chart-summary {
          display: flex;
          justify-content: space-around;
          padding: 1rem;
          background: white;
          border-radius: 6px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .summary-item span:first-child {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .summary-value {
          font-weight: 600;
          color: #1f2937;
        }

        .skill-progress h3 {
          margin-bottom: 1rem;
        }

        .skills-grid {
          display: grid;
          gap: 1rem;
        }

        .skill-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .skill-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .skill-name {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }

        .skill-level {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        .skill-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .skill-bar-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .domain-progress {
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .domain-timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-point {
          padding: 1rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .timeline-date {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .timeline-domains {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.5rem;
        }

        .domain-score {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 4px;
        }

        .domain-name {
          font-size: 0.875rem;
          color: #374151;
        }

        .domain-percentage {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        .no-chart {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .content-card {
            padding: 1rem;
          }

          .overview-cards {
            grid-template-columns: 1fr;
          }

          .progress-sections {
            grid-template-columns: 1fr;
          }

          .chart-grid {
            overflow-x: auto;
          }

          .timeline-domains {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
