// src/pages/StudentDashboard.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function StudentDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState({
    readinessScore: 0,
    bestDomain: '',
    topSkills: [],
    recentAnalyses: [],
    recommendations: [],
    progress: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [analysisRes, recommendationsRes, progressRes] = await Promise.all([
        api.get(`/analysis/student/${user.id}`),
        api.get(`/learning/recommendations/${user.id}`),
        api.get(`/progress/${user.id}`)
      ]);

      const analysis = analysisRes.data;
      const recommendations = recommendationsRes.data;
      const progress = progressRes.data;

      setDashboardData({
        readinessScore: analysis?.readiness_pct || 0,
        bestDomain: analysis?.best_domain || 'Not analyzed',
        topSkills: analysis?.top_skills || [],
        recentAnalyses: analysis ? [analysis] : [],
        recommendations: recommendations?.recommendations || [],
        progress: progress
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getReadinessColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getReadinessLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Ready';
    if (score >= 40) return 'Needs Work';
    return 'Not Ready';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Welcome back, {user.name}!</h1>
        <p>Your personalized placement readiness dashboard</p>
      </div>

      <div className="dashboard-grid">
        <div className="readiness-card">
          <div className="card-header">
            <h2>Placement Readiness</h2>
            <div className="card-icon">🎯</div>
          </div>
          <div className="readiness-display">
            <div 
              className="readiness-score"
              style={{ color: getReadinessColor(dashboardData.readinessScore) }}
            >
              {dashboardData.readinessScore.toFixed(1)}%
            </div>
            <div 
              className="readiness-status"
              style={{ 
                backgroundColor: getReadinessColor(dashboardData.readinessScore),
                color: 'white'
              }}
            >
              {getReadinessLabel(dashboardData.readinessScore)}
            </div>
          </div>
          <div className="readiness-details">
            <div className="detail-item">
              <span>Best Domain:</span>
              <span>{dashboardData.bestDomain}</span>
            </div>
            <div className="detail-item">
              <span>Analysis Date:</span>
              <span>
                {dashboardData.recentAnalyses.length > 0 
                  ? new Date(dashboardData.recentAnalyses[0].created_at).toLocaleDateString()
                  : 'Not analyzed'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="skills-card">
          <div className="card-header">
            <h2>Top Skills</h2>
            <div className="card-icon">🏆</div>
          </div>
          <div className="skills-list">
            {dashboardData.topSkills.length > 0 ? (
              dashboardData.topSkills.slice(0, 5).map((skill, index) => (
                <div key={index} className="skill-item">
                  <div className="skill-rank">#{index + 1}</div>
                  <div className="skill-info">
                    <div className="skill-name">{skill.name}</div>
                    <div className="skill-score">{skill.score}/5.0</div>
                  </div>
                  <div className="skill-bar">
                    <div 
                      className="skill-fill"
                      style={{ 
                        width: `${(skill.score / 5) * 100}%`,
                        backgroundColor: skill.score >= 4 ? '#10b981' : skill.score >= 3 ? '#3b82f6' : '#f59e0b'
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No skills analyzed yet</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => alert('Navigate to Placement Analyzer')}
                >
                  Get Analyzed
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="recommendations-card">
          <div className="card-header">
            <h2>Learning Recommendations</h2>
            <div className="card-icon">📚</div>
          </div>
          <div className="recommendations-list">
            {dashboardData.recommendations.length > 0 ? (
              dashboardData.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="rec-type">
                    {rec.recommendation_type === 'course' && '📖'}
                    {rec.recommendation_type === 'video' && '🎥'}
                    {rec.recommendation_type === 'platform' && '🏗️'}
                    {rec.recommendation_type === 'project' && '💼'}
                  </div>
                  <div className="rec-content">
                    <div className="rec-title">{rec.skill_name}</div>
                    <div className="rec-details">
                      <span className="rec-priority">{rec.priority}</span>
                      <span className="rec-time">{rec.estimated_time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No recommendations available</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => alert('Navigate to Learning Resources')}
                >
                  Get Recommendations
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="progress-card">
          <div className="card-header">
            <h2>Progress Tracking</h2>
            <div className="card-icon">📈</div>
          </div>
          {dashboardData.progress ? (
            <div className="progress-summary">
              <div className="progress-metrics">
                <div className="metric">
                  <span className="metric-label">Current Score:</span>
                  <span className="metric-value">
                    {dashboardData.progress.progress_data?.length > 0 
                      ? dashboardData.progress.progress_data[dashboardData.progress.progress_data.length - 1].readiness_score.toFixed(1)
                      : 'N/A'
                    }%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Trend:</span>
                  <span 
                    className="metric-value"
                    style={{ 
                      color: dashboardData.progress.trend_analysis?.trend === 'improving' ? '#10b981' : 
                             dashboardData.progress.trend_analysis?.trend === 'declining' ? '#ef4444' : '#6b7280'
                    }}
                  >
                    {dashboardData.progress.trend_analysis?.trend || 'N/A'}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Improvement:</span>
                  <span 
                    className="metric-value"
                    style={{ 
                      color: dashboardData.progress.trend_analysis?.improvement > 0 ? '#10b981' : '#ef4444'
                    }}
                  >
                    {dashboardData.progress.trend_analysis?.improvement > 0 ? '+' : ''}
                    {dashboardData.progress.trend_analysis?.improvement?.toFixed(1) || '0'}%
                  </span>
                </div>
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => alert('Navigate to Progress Tracking')}
              >
                View Full Progress
              </button>
            </div>
          ) : (
            <div className="no-data">
              <p>No progress data available</p>
              <p>Complete multiple analyses to track your progress</p>
            </div>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button 
            className="action-card"
            onClick={() => alert('Navigate to Placement Analyzer')}
          >
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h3>Placement Analyzer</h3>
              <p>Get detailed skill analysis</p>
            </div>
          </button>

          <button 
            className="action-card"
            onClick={() => alert('Navigate to Resume Analyzer')}
          >
            <div className="action-icon">📄</div>
            <div className="action-content">
              <h3>Resume Analyzer</h3>
              <p>Upload and analyze your resume</p>
            </div>
          </button>

          <button 
            className="action-card"
            onClick={() => alert('Navigate to Learning Resources')}
          >
            <div className="action-icon">📚</div>
            <div className="action-content">
              <h3>Learning Resources</h3>
              <p>Access personalized recommendations</p>
            </div>
          </button>

          <button 
            className="action-card"
            onClick={() => alert('Navigate to Job Recommendations')}
          >
            <div className="action-icon">💼</div>
            <div className="action-content">
              <h3>Job Recommendations</h3>
              <p>Find matching job opportunities</p>
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
          text-align: center;
        }

        .page-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: #6b7280;
          font-size: 1.2rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .readiness-card,
        .skills-card,
        .recommendations-card,
        .progress-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .card-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .card-icon {
          font-size: 1.5rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 50%;
        }

        .readiness-display {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .readiness-score {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .readiness-status {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .readiness-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          background: #f9fafb;
          border-radius: 6px;
        }

        .detail-item span:first-child {
          font-weight: 500;
          color: #6b7280;
        }

        .detail-item span:last-child {
          font-weight: 600;
          color: #1f2937;
        }

        .skills-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .skill-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .skill-rank {
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

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recommendation-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .rec-type {
          font-size: 1.5rem;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
          border-radius: 50%;
        }

        .rec-content {
          flex: 1;
        }

        .rec-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .rec-details {
          display: flex;
          gap: 1rem;
          margin-top: 0.25rem;
        }

        .rec-priority {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          background: #fef3c7;
          color: #92400e;
        }

        .rec-time {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .progress-summary {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .progress-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .metric-label {
          font-weight: 500;
          color: #6b7280;
        }

        .metric-value {
          font-weight: 600;
          color: #1f2937;
        }

        .no-data {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
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

        .btn-outline {
          background: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }

        .btn-outline:hover {
          background: #f9fafb;
        }

        .quick-actions {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .quick-actions h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
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
          background: #e5e7eb;
          border-radius: 50%;
          flex-shrink: 0;
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

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .readiness-score {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
}
