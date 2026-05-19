// src/pages/AIInsights.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AIInsights() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [insights, setInsights] = useState(null);
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

  const fetchInsights = async (studentId) => {
    setLoading(true);
    try {
      const response = await api.get(`/insights/${studentId}`);
      setInsights(response);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    if (studentId) {
      fetchInsights(studentId);
    } else {
      setInsights(null);
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.6) return '#3b82f6';
    if (confidence >= 0.4) return '#f59e0b';
    return '#ef4444';
  };

  const renderInsightCard = (insight, type) => (
    <div key={insight.category} className="insight-card">
      <div className="insight-header">
        <h3>{insight.category}</h3>
        <div className="insight-badges">
          <span 
            className="impact-badge" 
            style={{ backgroundColor: getImpactColor(insight.impact) }}
          >
            {insight.impact} Impact
          </span>
          <span 
            className="confidence-badge"
            style={{ color: getConfidenceColor(insight.confidence) }}
          >
            {Math.round(insight.confidence * 100)}% Confidence
          </span>
        </div>
      </div>
      
      <p className="insight-description">{insight.description}</p>
      
      <div className="insight-details">
        <div className="career-implications">
          <h4>Career Implications</h4>
          <p>{insight.career_implications}</p>
        </div>
        
        {insight.related_skills.length > 0 && (
          <div className="related-skills">
            <h4>Related Skills</h4>
            <div className="skill-tags">
              {insight.related_skills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
        
        <div className="actionable-steps">
          <h4>Actionable Steps</h4>
          <ul>
            {insight.actionable_steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>AI Insights</h1>
        <p>Comprehensive AI-powered analysis of strengths, weaknesses, and career opportunities</p>
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
            <p>Analyzing student profile and generating AI insights...</p>
          </div>
        )}

        {insights && !loading && (
          <div className="insights-container">
            <div className="career-suitability">
              <h2>Career Suitability Analysis</h2>
              <div className="suitability-grid">
                {Object.entries(insights.career_suitability).map(([domain, score]) => (
                  <div key={domain} className="suitability-item">
                    <h3>{domain}</h3>
                    <div className="suitability-score">
                      <div 
                        className="score-circle" 
                        style={{ 
                          color: score >= 0.7 ? '#10b981' : score >= 0.5 ? '#3b82f6' : '#f59e0b'
                        }}
                      >
                        {Math.round(score * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="insights-sections">
              <div className="insights-section">
                <h2>💪 Strengths</h2>
                {insights.insights.strengths.length > 0 ? (
                  <div className="insights-grid">
                    {insights.insights.strengths.map(strength => 
                      renderInsightCard(strength, 'strength')
                    )}
                  </div>
                ) : (
                  <div className="no-insights">
                    <p>No significant strengths identified</p>
                  </div>
                )}
              </div>

              <div className="insights-section">
                <h2>⚠️ Weaknesses</h2>
                {insights.insights.weaknesses.length > 0 ? (
                  <div className="insights-grid">
                    {insights.insights.weaknesses.map(weakness => 
                      renderInsightCard(weakness, 'weakness')
                    )}
                  </div>
                ) : (
                  <div className="no-insights">
                    <p>No significant weaknesses identified</p>
                  </div>
                )}
              </div>

              <div className="insights-section">
                <h2>🚨 Risk Areas</h2>
                {insights.insights.risk_areas.length > 0 ? (
                  <div className="insights-grid">
                    {insights.insights.risk_areas.map(risk => 
                      renderInsightCard(risk, 'risk')
                    )}
                  </div>
                ) : (
                  <div className="no-insights">
                    <p>No significant risk areas identified</p>
                  </div>
                )}
              </div>

              <div className="insights-section">
                <h2>🌟 Opportunities</h2>
                {insights.insights.opportunities.length > 0 ? (
                  <div className="insights-grid">
                    {insights.insights.opportunities.map(opportunity => 
                      renderInsightCard(opportunity, 'opportunity')
                    )}
                  </div>
                ) : (
                  <div className="no-insights">
                    <p>No specific opportunities identified</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedStudent && !insights && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <h3>No AI Insights Available</h3>
            <p>Make sure the student has completed skill assessments and analysis</p>
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

        .insights-container h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .career-suitability {
          margin-bottom: 3rem;
          padding: 2rem;
          background: #f9fafb;
          border-radius: 12px;
        }

        .suitability-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .suitability-item {
          text-align: center;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .suitability-item h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .score-circle {
          font-size: 2rem;
          font-weight: 700;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 3px solid currentColor;
          margin: 0 auto;
        }

        .insights-sections {
          display: grid;
          gap: 2rem;
        }

        .insights-section {
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 12px;
        }

        .insights-grid {
          display: grid;
          gap: 1.5rem;
        }

        .insight-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .insight-header h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1f2937;
        }

        .insight-badges {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }

        .impact-badge {
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .confidence-badge {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .insight-description {
          color: #374151;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .insight-details {
          display: grid;
          gap: 1.5rem;
        }

        .career-implications h4,
        .related-skills h4,
        .actionable-steps h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .career-implications p {
          color: #6b7280;
          line-height: 1.5;
        }

        .skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          padding: 0.25rem 0.75rem;
          background: #e5e7eb;
          color: #374151;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .actionable-steps ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .actionable-steps li {
          padding: 0.5rem 0;
          color: #374151;
          position: relative;
          padding-left: 1.5rem;
        }

        .actionable-steps li:before {
          content: "→";
          position: absolute;
          left: 0;
          color: #3b82f6;
          font-weight: bold;
        }

        .no-insights {
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

          .suitability-grid {
            grid-template-columns: 1fr;
          }

          .insight-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .insight-badges {
            flex-direction: row;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
