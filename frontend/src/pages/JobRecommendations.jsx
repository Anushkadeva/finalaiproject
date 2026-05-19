// src/pages/JobRecommendations.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function JobRecommendations() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const response = await api.get(`/jobs/recommend/${studentId}`);
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
      setRecommendations([]);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#3b82f6';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getGrowthColor = (potential) => {
    switch (potential) {
      case 'Very High': return '#10b981';
      case 'High': return '#3b82f6';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>AI Job Role Recommendations</h1>
        <p>Get personalized job recommendations based on your skills and interests</p>
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
            <p>Analyzing skills and finding best matches...</p>
          </div>
        )}

        {recommendations.length > 0 && !loading && (
          <div className="recommendations-grid">
            <h2>Top Job Recommendations</h2>
            {recommendations.map((job, index) => (
              <div key={index} className="job-card">
                <div className="job-header">
                  <div className="job-title">
                    <h3>{job.job_role}</h3>
                    <span className="job-domain">{job.domain}</span>
                  </div>
                  <div className="match-percentage" style={{ color: getMatchColor(job.match_percentage) }}>
                    {job.match_percentage}% Match
                  </div>
                </div>

                <div className="job-details">
                  <p className="job-description">{job.description}</p>
                  
                  <div className="job-metrics">
                    <div className="metric">
                      <span className="metric-label">Salary:</span>
                      <span className="metric-value">{job.salary_range}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Growth:</span>
                      <span 
                        className="metric-value" 
                        style={{ color: getGrowthColor(job.growth_potential) }}
                      >
                        {job.growth_potential}
                      </span>
                    </div>
                  </div>

                  <div className="skills-analysis">
                    <div className="strengths">
                      <h4>Your Strengths</h4>
                      <div className="skill-tags">
                        {job.strengths.map((skill, i) => (
                          <span key={i} className="skill-tag strength">{skill}</span>
                        ))}
                      </div>
                    </div>

                    {job.missing_skills.length > 0 && (
                      <div className="gaps">
                        <h4>Skills to Develop</h4>
                        <div className="skill-tags">
                          {job.missing_skills.map((skill, i) => (
                            <span key={i} className="skill-tag gap">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedStudent && recommendations.length === 0 && !loading && (
          <div className="empty-state">
            <p>No job recommendations available for this student.</p>
            <p>Try updating the student's skill ratings or interested domain.</p>
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

        .recommendations-grid h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .job-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }

        .job-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .job-title h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .job-domain {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 20px;
          font-size: 0.875rem;
        }

        .match-percentage {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .job-description {
          color: #6b7280;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .job-metrics {
          display: flex;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .metric {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .metric-value {
          font-weight: 600;
          color: #1f2937;
        }

        .skills-analysis {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .strengths h4,
        .gaps h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .skill-tag.strength {
          background: #d1fae5;
          color: #065f46;
        }

        .skill-tag.gap {
          background: #fee2e2;
          color: #991b1b;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .content-card {
            padding: 1rem;
          }

          .job-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .job-metrics {
            flex-direction: column;
            gap: 1rem;
          }

          .skills-analysis {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
