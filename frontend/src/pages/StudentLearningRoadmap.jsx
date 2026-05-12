// src/pages/StudentLearningRoadmap.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function StudentLearningRoadmap({ user }) {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, [user]);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/learning-roadmap/${user.id}`);
      setRoadmap(response.data.weeks || []);
    } catch (error) {
      console.error('Error fetching learning roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Learning Roadmap</h1>
        <p>Your personalized 6-week learning plan</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating your personalized learning roadmap...</p>
        </div>
      ) : (
        <div className="roadmap-content">
          <div className="roadmap-timeline">
            {roadmap.map((week, index) => (
              <div key={index} className="week-card">
                <div className="week-header">
                  <div className="week-number">Week {week.week}</div>
                  <div className="week-focus">{week.focus}</div>
                </div>

                <div className="week-content">
                  <div className="content-section">
                    <h3>Focus Area</h3>
                    <p>{week.focus}</p>
                  </div>

                  <div className="content-section">
                    <h3>Resources</h3>
                    <div className="resources-list">
                      {week.resources.map((resource, i) => (
                        <div key={i} className="resource-item">
                          <span className="resource-name">{resource}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="content-section">
                    <h3>Projects</h3>
                    <div className="projects-list">
                      {week.projects.map((project, i) => (
                        <div key={i} className="project-item">
                          <span className="project-name">{project}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="content-section">
                    <h3>Certifications</h3>
                    <div className="certifications-list">
                      {week.certifications.map((cert, i) => (
                        <div key={i} className="cert-item">
                          <span className="cert-name">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="week-progress">
                  <div className="progress-title">
                    <span className="progress-icon">📊</span>
                    <span>Week Progress</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((index + 1) / roadmap.length) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="roadmap-actions">
            <h3>Actions</h3>
            <div className="actions-grid">
              <button className="action-card">
                <div className="action-icon">📧</div>
                <div className="action-content">
                  <h4>Download Roadmap</h4>
                  <p>Get your complete learning plan as PDF</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">🔄</div>
                <div className="action-content">
                  <h4>Refresh Roadmap</h4>
                  <p>Update your personalized learning plan</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">💬</div>
                <div className="action-content">
                  <h4>Provide Feedback</h4>
                  <p>Share your thoughts on the learning plan</p>
                </div>
              </button>
            </div>
          </div>
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
          text-align: center;
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

        .roadmap-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .roadmap-timeline {
          position: relative;
          padding-left: 2rem;
        }

        .roadmap-timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #3b82f6;
          border-radius: 1px;
        }

        .week-card {
          position: relative;
          background: #f9fafb;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .week-card:hover {
          box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .week-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .week-number {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .week-focus {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .week-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .content-section {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e5e7eb;
        }

        .content-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .content-section p {
          color: #374151;
          line-height: 1.5;
          margin: 0;
        }

        .resources-list,
        .projects-list,
        .certifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .resource-item,
        .project-item,
        .cert-item {
          padding: 0.5rem 0.75rem;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #374151;
        }

        .resource-name,
        .project-name,
        .cert-name {
          font-weight: 500;
        }

        .week-progress {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .progress-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .progress-icon {
          font-size: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
          transition: width 0.3s ease;
        }

        .roadmap-actions {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .roadmap-actions h3 {
          font-size: 1.25rem;
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
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .action-card:hover {
          box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .action-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .action-content p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .week-content {
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
