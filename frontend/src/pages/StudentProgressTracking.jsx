// src/pages/StudentProgressTracking.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function StudentProgressTracking({ user }) {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/progress/${user.id}`);
      setProgressData(response.progress_data || []);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
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

  const getReadinessColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Progress Tracking</h1>
        <p>Monitor your placement readiness and skill improvement over time</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your progress data...</p>
        </div>
      ) : progressData.length > 0 ? (
        <div className="progress-content">
          <div className="progress-summary">
            <h2>Progress Overview</h2>
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <h3>Current Readiness</h3>
                  <div 
                    className="readiness-score"
                    style={{ color: getReadinessColor(progressData[progressData.length - 1]?.readiness_score || 0) }}
                  >
                    {progressData[progressData.length - 1]?.readiness_score?.toFixed(1) || '0'}%
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon">📈</div>
                <div className="card-content">
                  <h3>Overall Trend</h3>
                  <div className="trend-display">
                    <span 
                      className="trend-icon"
                      style={{ color: getTrendColor(progressData[progressData.length - 1]?.trend_analysis?.trend || 'stable') }}
                    >
                      {getTrendIcon(progressData[progressData.length - 1]?.trend_analysis?.trend || 'stable')}
                    </span>
                    <span className="trend-text">
                      {progressData[progressData.length - 1]?.trend_analysis?.trend || 'stable'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon">🎯</div>
                <div className="card-content">
                  <h3>Total Improvement</h3>
                  <div className="improvement-score">
                    <span 
                      className="improvement-value"
                      style={{ 
                        color: (progressData[progressData.length - 1]?.trend_analysis?.improvement || 0) > 0 ? '#10b981' : '#ef4444'
                      }}
                    >
                      {(progressData[progressData.length - 1]?.trend_analysis?.improvement || 0) > 0 ? '+' : ''}
                      {Math.abs(progressData[progressData.length - 1]?.trend_analysis?.improvement || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="progress-chart">
            <h2>Readiness Progress Chart</h2>
            <div className="chart-container">
              {progressData.map((point, index) => (
                <div key={index} className="chart-point">
                  <div className="point-info">
                    <div className="point-date">
                      {new Date(point.date).toLocaleDateString()}
                    </div>
                    <div className="point-score">
                      {point.readiness_score.toFixed(1)}%
                    </div>
                  </div>
                  <div className="point-bar">
                    <div 
                      className="bar-fill"
                      style={{ 
                        height: `${point.readiness_score}%`,
                        backgroundColor: getReadinessColor(point.readiness_score)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="skill-progress">
            <h2>Skill Progress</h2>
            <div className="skills-grid">
              {progressData[progressData.length - 1]?.skill_scores && Object.entries(progressData[progressData.length - 1].skill_scores).map(([skill, score], index) => (
                <div key={index} className="skill-item">
                  <div className="skill-info">
                    <div className="skill-name">{skill}</div>
                    <div className="skill-score">{score}/5</div>
                  </div>
                  <div className="skill-bar">
                    <div 
                      className="skill-fill"
                      style={{ 
                        width: `${(score / 5) * 100}%`,
                        backgroundColor: getReadinessColor(score)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <h3>No Progress Data Available</h3>
          <p>Complete multiple analyses to track your progress over time</p>
          <button 
            className="btn btn-primary"
            onClick={() => alert('Navigate to Placement Analyzer')}
          >
            Get Analyzed
          </button>
        </div>
      )}

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

        .progress-content {
          display: grid;
          gap: 2rem;
        }

        .progress-summary h2,
        .progress-chart h2,
        .skill-progress h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
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
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .readiness-score {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
        }

        .trend-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .trend-icon {
          font-size: 1.5rem;
        }

        .trend-text {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .improvement-score {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .improvement-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .progress-chart {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .chart-container {
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
          font-size: 1rem;
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

        .skill-progress {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .skill-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
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
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
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

        .no-data {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .no-data-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .no-data h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .no-data p {
          margin-bottom: 1rem;
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

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .chart-container {
            flex-direction: column;
            height: auto;
          }

          .skills-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
