// src/pages/LearningRecommendations.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function LearningRecommendations() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchRecommendations = async (studentId) => {
    setLoading(true);
    try {
      const response = await api.get(`/learning/recommendations/${studentId}`);
      setRecommendations(response);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    if (studentId) {
      fetchRecommendations(studentId);
    } else {
      setRecommendations(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#3b82f6';
      case 'advanced': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'course': return '📚';
      case 'video': return '🎥';
      case 'platform': return '🏗️';
      case 'project': return '💼';
      default: return '📖';
    }
  };

  const filteredRecommendations = recommendations ? 
    recommendations.recommendations.filter(rec => filter === 'all' || rec.priority === filter) : [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Learning Recommendations</h1>
        <p>Personalized learning resources to bridge your skill gaps</p>
      </div>

      <div className="content-card">
        <div className="controls-section">
          <div className="form-row">
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

            <div className="form-group">
              <label>Filter by Priority:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Recommendations</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Generating personalized learning recommendations...</p>
          </div>
        )}

        {recommendations && !loading && (
          <div className="recommendations-container">
            <div className="learning-path">
              <h2>Your 6-Week Learning Path</h2>
              <div className="path-timeline">
                {recommendations.learning_path.map((week, index) => (
                  <div key={index} className="week-card">
                    <div className="week-header">
                      <div className="week-number">Week {week.week}</div>
                      <div className="week-focus">{week.focus}</div>
                    </div>
                    <div className="week-resources">
                      <span className="resource-text">{week.resources.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="recommendations-grid">
              <h2>Personalized Recommendations ({filteredRecommendations.length})</h2>
              
              {filteredRecommendations.length > 0 ? (
                <div className="recommendations-list">
                  {filteredRecommendations.map((rec, index) => (
                    <div key={index} className="recommendation-card">
                      <div className="recommendation-header">
                        <div className="recommendation-icon">
                          {getRecommendationIcon(rec.recommendation_type)}
                        </div>
                        <div className="recommendation-title">
                          <h3>{rec.skill_name}</h3>
                          <div className="recommendation-meta">
                            <span className="skill-levels">
                              Level {rec.current_level} → {rec.target_level}
                            </span>
                            <span 
                              className="priority-badge" 
                              style={{ backgroundColor: getPriorityColor(rec.priority) }}
                            >
                              {rec.priority} priority
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="recommendation-content">
                        <div className="resource-details">
                          {rec.recommendation_type === 'course' && (
                            <div className="course-details">
                              <h4>{rec.recommendation_data.title}</h4>
                              <p><strong>Platform:</strong> {rec.recommendation_data.platform}</p>
                              <p><strong>Provider:</strong> {rec.recommendation_data.provider}</p>
                              <p><strong>Duration:</strong> {rec.recommendation_data.duration}</p>
                              <p><strong>Rating:</strong> ⭐ {rec.recommendation_data.rating}</p>
                              <div className="course-skills">
                                <strong>Skills:</strong>
                                <div className="skill-tags">
                                  {rec.recommendation_data.skills.map((skill, i) => (
                                    <span key={i} className="skill-tag">{skill}</span>
                                  ))}
                                </div>
                              </div>
                              <a 
                                href={rec.recommendation_data.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="course-link"
                              >
                                View Course →
                              </a>
                            </div>
                          )}

                          {rec.recommendation_type === 'video' && (
                            <div className="video-details">
                              <h4>{rec.recommendation_data.title}</h4>
                              <p><strong>Channel:</strong> {rec.recommendation_data.channel}</p>
                              <p><strong>Duration:</strong> {rec.recommendation_data.duration}</p>
                              <p><strong>Views:</strong> {rec.recommendation_data.views}</p>
                              <div className="video-skills">
                                <strong>Skills:</strong>
                                <div className="skill-tags">
                                  {rec.recommendation_data.skills.map((skill, i) => (
                                    <span key={i} className="skill-tag">{skill}</span>
                                  ))}
                                </div>
                              </div>
                              <a 
                                href={rec.recommendation_data.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="video-link"
                              >
                                Watch Video →
                              </a>
                            </div>
                          )}

                          {rec.recommendation_type === 'platform' && (
                            <div className="platform-details">
                              <h4>{rec.recommendation_data.name}</h4>
                              <p>{rec.recommendation_data.description}</p>
                              <p><strong>Difficulty:</strong> {rec.recommendation_data.difficulty}</p>
                              <div className="platform-features">
                                <strong>Features:</strong>
                                <ul>
                                  {rec.recommendation_data.features.map((feature, i) => (
                                    <li key={i}>{feature}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="platform-skills">
                                <strong>Skills:</strong>
                                <div className="skill-tags">
                                  {rec.recommendation_data.skills.map((skill, i) => (
                                    <span key={i} className="skill-tag">{skill}</span>
                                  ))}
                                </div>
                              </div>
                              <a 
                                href={rec.recommendation_data.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="platform-link"
                              >
                                Visit Platform →
                              </a>
                            </div>
                          )}

                          {rec.recommendation_type === 'project' && (
                            <div className="project-details">
                              <h4>{rec.recommendation_data.title}</h4>
                              <p>{rec.recommendation_data.description}</p>
                              <p><strong>Difficulty:</strong> {rec.recommendation_data.difficulty}</p>
                              <p><strong>Duration:</strong> {rec.recommendation_data.duration}</p>
                              <div className="project-skills">
                                <strong>Skills:</strong>
                                <div className="skill-tags">
                                  {rec.recommendation_data.skills.map((skill, i) => (
                                    <span key={i} className="skill-tag">{skill}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="project-tech">
                                <strong>Technologies:</strong>
                                <div className="tech-tags">
                                  {rec.recommendation_data.technologies.map((tech, i) => (
                                    <span key={i} className="tech-tag">{tech}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="recommendation-footer">
                          <div className="time-estimate">
                            <span>⏱️ {rec.estimated_time}</span>
                          </div>
                          <div className="difficulty-level">
                            <span 
                              style={{ color: getDifficultyColor(rec.difficulty_level) }}
                            >
                              {rec.difficulty_level}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-recommendations">
                  <p>No recommendations found for the selected filter</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedStudent && !recommendations && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No Learning Recommendations Available</h3>
            <p>Make sure the student has completed skill assessments</p>
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

        .controls-section {
          margin-bottom: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
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

        .recommendations-container h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .learning-path {
          margin-bottom: 3rem;
          padding: 2rem;
          background: #f9fafb;
          border-radius: 12px;
        }

        .path-timeline {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .week-card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          text-align: center;
        }

        .week-header {
          margin-bottom: 0.5rem;
        }

        .week-number {
          font-size: 0.875rem;
          font-weight: 600;
          color: #3b82f6;
          margin-bottom: 0.25rem;
        }

        .week-focus {
          font-weight: 600;
          color: #1f2937;
        }

        .week-resources {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .recommendations-grid {
          margin-bottom: 2rem;
        }

        .recommendations-list {
          display: grid;
          gap: 1.5rem;
        }

        .recommendation-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .recommendation-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .recommendation-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .recommendation-icon {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .recommendation-title {
          flex: 1;
        }

        .recommendation-title h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .recommendation-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .skill-levels {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .priority-badge {
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .recommendation-content {
          margin-bottom: 1rem;
        }

        .course-details,
        .video-details,
        .platform-details,
        .project-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .course-details h4,
        .video-details h4,
        .platform-details h4,
        .project-details h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .course-details p,
        .video-details p,
        .platform-details p,
        .project-details p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .course-skills,
        .video-skills,
        .platform-skills,
        .project-skills,
        .project-tech {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .skill-tags,
        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .skill-tag,
        .tech-tag {
          padding: 0.25rem 0.75rem;
          background: #e5e7eb;
          color: #374151;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .tech-tag {
          background: #dbeafe;
          color: #1e40af;
        }

        .platform-features {
          margin: 0;
        }

        .platform-features ul {
          list-style: none;
          padding: 0;
          margin: 0.25rem 0 0 0;
        }

        .platform-features li {
          padding: 0.25rem 0;
          color: #6b7280;
          position: relative;
          padding-left: 1rem;
        }

        .platform-features li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #3b82f6;
        }

        .course-link,
        .video-link,
        .platform-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .course-link:hover,
        .video-link:hover,
        .platform-link:hover {
          text-decoration: underline;
        }

        .recommendation-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .time-estimate {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .difficulty-level {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .no-recommendations {
          text-align: center;
          padding: 2rem;
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

          .form-row {
            grid-template-columns: 1fr;
          }

          .path-timeline {
            grid-template-columns: 1fr;
          }

          .recommendation-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .recommendation-meta {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
