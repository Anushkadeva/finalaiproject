// src/pages/SkillGapAnalysis.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function SkillGapAnalysis() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const domains = ['Data & AI', 'IT / Software', 'Design', 'Marketing'];

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

  const fetchGapAnalysis = async () => {
    if (!selectedStudent) return;
    
    setLoading(true);
    try {
      const url = selectedDomain 
        ? `/analysis/skill-gaps/${selectedStudent}?domain=${selectedDomain}`
        : `/analysis/skill-gaps/${selectedStudent}`;
      
      const response = await api.get(url);
      setGapAnalysis(response.data);
    } catch (error) {
      console.error('Error fetching gap analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      fetchGapAnalysis();
    }
  }, [selectedStudent, selectedDomain]);

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    if (!studentId) {
      setGapAnalysis(null);
    }
  };

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
  };

  const getGapSeverityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getReadinessColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#3b82f6';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const renderProgressBar = (current, required) => {
    const percentage = Math.min((current / required) * 100, 100);
    return (
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#3b82f6' : '#f59e0b'
          }}
        ></div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Skill Gap Analysis</h1>
        <p>Compare your skills with industry requirements and identify areas for improvement</p>
      </div>

      <div className="content-card">
        <div className="form-section">
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
              <label>Target Domain (Optional):</label>
              <select 
                value={selectedDomain} 
                onChange={handleDomainChange}
                className="form-select"
              >
                <option value="">Use student's preferred domain</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing skill gaps...</p>
          </div>
        )}

        {gapAnalysis && !loading && (
          <div className="analysis-results">
            <div className="readiness-overview">
              <h2>Overall Readiness</h2>
              <div className="readiness-score">
                <div 
                  className="score-circle" 
                  style={{ color: getReadinessColor(gapAnalysis.overall_readiness) }}
                >
                  {gapAnalysis.overall_readiness}%
                </div>
                <div className="readiness-details">
                  <h3>Target Domain: {gapAnalysis.target_domain}</h3>
                  <p>Based on industry requirements for this domain</p>
                </div>
              </div>
            </div>

            <div className="analysis-grid">
              <div className="skill-gaps-section">
                <h2>Skill Gaps to Address</h2>
                {gapAnalysis.skill_gaps.length > 0 ? (
                  <div className="gaps-list">
                    {gapAnalysis.skill_gaps.map((gap, index) => (
                      <div key={index} className="gap-item">
                        <div className="gap-header">
                          <h4>{gap.skill}</h4>
                          <span 
                            className="priority-badge"
                            style={{ backgroundColor: getGapSeverityColor(gap.priority) }}
                          >
                            {gap.priority} Priority
                          </span>
                        </div>
                        
                        <div className="skill-levels">
                          <div className="level-info">
                            <span>Current: {gap.current_level}/5</span>
                            <span>Required: {gap.required_level}/5</span>
                          </div>
                          {renderProgressBar(gap.current_level, gap.required_level)}
                          <div className="gap-size">
                            Gap: {gap.gap} levels
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-gaps">
                    <p>🎉 No significant skill gaps found!</p>
                    <p>You're meeting the industry requirements for this domain.</p>
                  </div>
                )}
              </div>

              <div className="strengths-section">
                <h2>Your Strengths</h2>
                {gapAnalysis.strengths.length > 0 ? (
                  <div className="strengths-list">
                    {gapAnalysis.strengths.map((strength, index) => (
                      <div key={index} className="strength-item">
                        <div className="strength-header">
                          <h4>{strength.skill}</h4>
                          <span className="level-badge">
                            Level {strength.level}/5
                          </span>
                        </div>
                        
                        <div className="strength-details">
                          {strength.above_requirement > 0 && (
                            <p>Above requirement by {strength.above_requirement} levels</p>
                          )}
                          {renderProgressBar(strength.level, 5)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-strengths">
                    <p>Focus on developing your core skills first.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="recommendations-section">
              <h2>Recommendations</h2>
              <div className="recommendation-cards">
                {gapAnalysis.skill_gaps.slice(0, 3).map((gap, index) => (
                  <div key={index} className="recommendation-card">
                    <h4>Focus on {gap.skill}</h4>
                    <p>Priority: {gap.priority}</p>
                    <div className="action-items">
                      <div className="action-item">
                        <span className="icon">📚</span>
                        <span>Take online courses and tutorials</span>
                      </div>
                      <div className="action-item">
                        <span className="icon">🏗️</span>
                        <span>Build practice projects</span>
                      </div>
                      <div className="action-item">
                        <span className="icon">🏆</span>
                        <span>Get certifications</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedStudent && !gapAnalysis && !loading && (
          <div className="empty-state">
            <p>No skill gap analysis available.</p>
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

        .analysis-results h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .readiness-overview {
          text-align: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: #f9fafb;
          border-radius: 12px;
        }

        .readiness-score {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-top: 1rem;
        }

        .score-circle {
          font-size: 3rem;
          font-weight: 700;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 4px solid currentColor;
        }

        .readiness-details h3 {
          font-size: 1.25rem;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .readiness-details p {
          color: #6b7280;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .gaps-list,
        .strengths-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .gap-item,
        .strength-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
        }

        .gap-header,
        .strength-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .gap-header h4,
        .strength-header h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .priority-badge {
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .level-badge {
          background: #e5e7eb;
          color: #374151;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .skill-levels {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .level-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #6b7280;
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
          transition: width 0.3s ease;
        }

        .gap-size {
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .no-gaps,
        .no-strengths {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .recommendations-section {
          margin-top: 2rem;
        }

        .recommendation-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .recommendation-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .recommendation-card h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .recommendation-card p {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .action-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #374151;
        }

        .icon {
          font-size: 1rem;
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

          .form-row {
            grid-template-columns: 1fr;
          }

          .readiness-score {
            flex-direction: column;
            gap: 1rem;
          }

          .analysis-grid {
            grid-template-columns: 1fr;
          }

          .recommendation-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
