// src/pages/StudentLearningResources.jsx

import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function StudentLearningResources({ user }) {
  const [resources, setResources] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchResources();
    }
  }, [user]);

  const fetchResources = async () => {
    setLoading(true);

    try {
      const response = await api.get(
        `/learning/recommendations/${user.id}`
      );

      setResources(
        response.data?.recommendations || []
      );
    } catch (error) {
      console.error(
        'Error fetching learning resources:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(
    (rec) =>
      (filter === 'all' ||
        rec.recommendation_type === filter) &&
      (!selectedSkill ||
        rec.skill_name === selectedSkill)
  );

  const uniqueSkills = [
    ...new Set(
      resources.map((r) => r.skill_name)
    )
  ];

  const getResourceIcon = (type) => {
    switch (type) {
      case 'course':
        return '📖';

      case 'video':
        return '🎥';

      case 'platform':
        return '🏗️';

      case 'project':
        return '💼';

      default:
        return '📚';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return '#10b981';

      case 'intermediate':
        return '#3b82f6';

      case 'advanced':
        return '#8b5cf6';

      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';

      case 'medium':
        return '#f59e0b';

      case 'low':
        return '#10b981';

      default:
        return '#6b7280';
    }
  };

  return (
    <div className="page-container">

      <div className="page-header">
        <h1>Learning Resources</h1>

        <p>
          Personalized learning materials to improve
          your skills
        </p>
      </div>

      {/* Controls */}
      <div className="resources-controls">

        <div className="control-group">
          <label>Filter by Type:</label>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="control-select"
          >
            <option value="all">
              All Resources
            </option>

            <option value="course">
              Courses
            </option>

            <option value="video">
              Videos
            </option>

            <option value="platform">
              Practice Platforms
            </option>

            <option value="project">
              Projects
            </option>
          </select>
        </div>

        <div className="control-group">
          <label>Filter by Skill:</label>

          <select
            value={selectedSkill}
            onChange={(e) =>
              setSelectedSkill(e.target.value)
            }
            className="control-select"
          >
            <option value="">
              All Skills
            </option>

            {uniqueSkills.map((skill, index) => (
              <option
                key={index}
                value={skill}
              >
                {skill}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={fetchResources}
        >
          🔄 Refresh Resources
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>

          <p>
            Loading your personalized learning
            resources...
          </p>
        </div>
      ) : (
        <div className="resources-content">

          {/* Summary */}
          <div className="resources-summary">

            <div className="summary-cards">

              <div className="summary-card">
                <h3>Total Resources</h3>

                <div className="summary-value">
                  {filteredResources.length}
                </div>
              </div>

              <div className="summary-card">
                <h3>High Priority</h3>

                <div
                  className="summary-value"
                  style={{ color: '#ef4444' }}
                >
                  {
                    filteredResources.filter(
                      (r) =>
                        r.priority === 'high'
                    ).length
                  }
                </div>
              </div>

              <div className="summary-card">
                <h3>Medium Priority</h3>

                <div
                  className="summary-value"
                  style={{ color: '#f59e0b' }}
                >
                  {
                    filteredResources.filter(
                      (r) =>
                        r.priority === 'medium'
                    ).length
                  }
                </div>
              </div>

              <div className="summary-card">
                <h3>Low Priority</h3>

                <div
                  className="summary-value"
                  style={{ color: '#10b981' }}
                >
                  {
                    filteredResources.filter(
                      (r) =>
                        r.priority === 'low'
                    ).length
                  }
                </div>
              </div>

            </div>
          </div>

          {/* Resource Cards */}
          <div className="resources-grid">

            {filteredResources.length > 0 ? (
              filteredResources.map(
                (resource, index) => (
                  <div
                    key={index}
                    className="resource-card"
                  >

                    {/* Header */}
                    <div className="resource-header">

                      <div className="resource-type">

                        <span className="type-icon">
                          {getResourceIcon(
                            resource.recommendation_type
                          )}
                        </span>

                        <span className="type-label">
                          {
                            resource.recommendation_type
                          }
                        </span>
                      </div>

                      <div className="resource-info">

                        <h3>
                          {resource.skill_name}
                        </h3>

                        <div className="resource-meta">

                          <div className="meta-item">
                            <span className="meta-label">
                              Current Level:
                            </span>

                            <span className="meta-value">
                              {
                                resource.current_level
                              }
                              /5
                            </span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">
                              Target Level:
                            </span>

                            <span className="meta-value">
                              {
                                resource.target_level
                              }
                              /5
                            </span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">
                              Priority:
                            </span>

                            <span
                              className="priority-badge"
                              style={{
                                backgroundColor:
                                  getPriorityColor(
                                    resource.priority
                                  )
                              }}
                            >
                              {resource.priority}
                            </span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">
                              Time Required:
                            </span>

                            <span className="meta-value">
                              {
                                resource.estimated_time
                              }
                            </span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">
                              Difficulty:
                            </span>

                            <span
                              className="difficulty-badge"
                              style={{
                                backgroundColor:
                                  getDifficultyColor(
                                    resource.difficulty_level
                                  ),
                                color: 'white'
                              }}
                            >
                              {
                                resource.difficulty_level
                              }
                            </span>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="resource-content">

                      {/* Details */}
                      <div className="resource-details">

                        <h4>
                          Resource Details
                        </h4>

                        <div className="details-list">

                          <div className="detail-item">
                            <span className="detail-label">
                              Title:
                            </span>

                            <span className="detail-value">
                              {
                                resource
                                  .recommendation_data
                                  ?.title
                              }
                            </span>
                          </div>

                          <div className="detail-item">
                            <span className="detail-label">
                              Platform:
                            </span>

                            <span className="detail-value">
                              {resource
                                .recommendation_data
                                ?.platform ||
                                resource
                                  .recommendation_data
                                  ?.channel ||
                                'N/A'}
                            </span>
                          </div>

                          <div className="detail-item">
                            <span className="detail-label">
                              Provider:
                            </span>

                            <span className="detail-value">
                              {resource
                                .recommendation_data
                                ?.provider ||
                                'N/A'}
                            </span>
                          </div>

                          <div className="detail-item">
                            <span className="detail-label">
                              Duration:
                            </span>

                            <span className="detail-value">
                              {resource
                                .recommendation_data
                                ?.duration ||
                                'N/A'}
                            </span>
                          </div>

                          <div className="detail-item">
                            <span className="detail-label">
                              Rating:
                            </span>

                            <span className="detail-value">
                              {resource
                                .recommendation_data
                                ?.rating
                                ? `⭐ ${resource.recommendation_data.rating}`
                                : 'N/A'}
                            </span>
                          </div>

                        </div>
                      </div>

                      {/* Skills & Tech */}
                      <div className="resource-actions">

                        <h4>Skills Covered</h4>

                        <div className="skills-tags">
                          {resource
                            .recommendation_data
                            ?.skills?.map(
                              (skill, i) => (
                                <span
                                  key={i}
                                  className="skill-tag"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                        </div>

                        <div className="technologies-list">

                          <h4>
                            Technologies
                          </h4>

                          <div className="tech-tags">
                            {resource
                              .recommendation_data
                              ?.technologies?.map(
                                (tech, i) => (
                                  <span
                                    key={i}
                                    className="tech-tag"
                                  >
                                    {tech}
                                  </span>
                                )
                              )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="resource-actions-buttons">

                      <button className="btn btn-primary">
                        🔗 Access Resource
                      </button>

                      <button className="btn btn-outline">
                        📋 Save for Later
                      </button>

                      <button className="btn btn-outline">
                        📧 Share Resource
                      </button>

                    </div>
                  </div>
                )
              )
            ) : (
              <div className="no-results">
                <h3>
                  No learning resources found
                </h3>

                <p>
                  Try changing filters or refresh
                  recommendations.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      <style>{`
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
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .resources-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group label {
          font-weight: 600;
          color: #374151;
        }

        .control-select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          min-width: 220px;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
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
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(200px, 1fr)
          );
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: white;
          border-radius: 10px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 2px 6px
            rgba(0, 0, 0, 0.08);
        }

        .summary-value {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(420px, 1fr)
          );
          gap: 2rem;
        }

        .resource-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px
            rgba(0, 0, 0, 0.08);
        }

        .resource-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .type-icon {
          font-size: 2rem;
        }

        .type-label {
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
        }

        .resource-meta {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(150px, 1fr)
          );
          gap: 1rem;
          margin-top: 1rem;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
        }

        .meta-label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .meta-value {
          font-weight: 600;
        }

        .priority-badge,
        .difficulty-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          width: fit-content;
        }

        .resource-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .details-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .detail-label {
          font-weight: 500;
          color: #6b7280;
        }

        .detail-value {
          font-weight: 600;
          color: #1f2937;
          text-align: right;
        }

        .skills-tags,
        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag,
        .tech-tag {
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 20px;
          font-size: 0.75rem;
        }

        .resource-actions-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1.5rem;
        }

        .no-results {
          padding: 3rem;
          text-align: center;
          background: white;
          border-radius: 12px;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .resources-grid {
            grid-template-columns: 1fr;
          }

          .resource-header {
            flex-direction: column;
          }

          .resource-actions-buttons {
            flex-direction: column;
          }

          .detail-item {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}