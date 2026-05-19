// src/pages/StudentSkillAnalysis.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function StudentSkillAnalysis({ user }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [user]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/skill-gap-analysis/${user.id}`);
      setAnalysis(response);
    } catch (error) {
      console.error('Error fetching skill analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillColor = (level) => {
    if (level >= 4) return '#10b981';
    if (level >= 3) return '#3b82f6';
    if (level >= 2) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Skill Analysis</h1>
        <p>Detailed analysis of your skills and areas for improvement</p>
      </div>

      <div className="analysis-controls">
        <div className="control-group">
          <label>Filter by Domain:</label>
          <select 
            value={selectedDomain} 
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="domain-select"
          >
            <option value="">All Skills</option>
            <option value="Data & AI">Data & AI</option>
            <option value="IT / Software">IT / Software</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={fetchAnalysis}>
          🔄 Refresh Analysis
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing your skills...</p>
        </div>
      ) : analysis && (
        <div className="analysis-content">
          <div className="skills-overview">
            <h2>Skills Overview</h2>
            <div className="skills-grid">
              {analysis.skill_gaps.map((skill, index) => (
                <div key={index} className="skill-card">
                  <div className="skill-header">
                    <h3>{skill.skill}</h3>
                    <div className="skill-level">
                      <span className="level-number">{skill.current_level}</span>
                      <span className="level-text">/5</span>
                    </div>
                  </div>
                  <div className="skill-bar">
                    <div className="bar-background">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${(skill.current_level / 5) * 100}%`,
                          backgroundColor: getSkillColor(skill.current_level)
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="skill-details">
                    <div className="detail-item">
                      <span>Required Level:</span>
                      <span>{skill.required_level}</span>
                    </div>
                    <div className="detail-item">
                      <span>Gap:</span>
                      <span>{skill.gap}</span>
                    </div>
                    <div className="detail-item">
                      <span>Priority:</span>
                      <span className={`priority ${skill.priority}`}>{skill.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="gaps-section">
            <h2>Skill Gaps Analysis</h2>
            <div className="gaps-list">
              {analysis.skill_gaps.filter(skill => skill.gap > 0).map((skill, index) => (
                <div key={index} className="gap-item">
                  <div className="gap-icon">⚠️</div>
                  <div className="gap-content">
                    <h3>{skill.skill}</h3>
                    <p>Current: {skill.current_level}/5 | Required: {skill.required_level}/5</p>
                    <p>Gap: {skill.gap} points</p>
                    <div className="gap-recommendations">
                      <h4>Recommendations:</h4>
                      <ul>
                        <li>Focus on improving this skill through targeted practice</li>
                        <li>Take courses or tutorials specific to this skill</li>
                        <li>Work on projects that require this skill</li>
                        <li>Seek mentorship from experts in this area</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="strengths-section">
            <h2>Strengths</h2>
            <div className="strengths-list">
              {analysis.skill_gaps.filter(skill => skill.current_level >= 4).map((skill, index) => (
                <div key={index} className="strength-item">
                  <div className="strength-icon">🌟</div>
                  <div className="strength-content">
                    <h3>{skill.skill}</h3>
                    <p>Excellent performance with {skill.current_level}/5 rating</p>
                    <p>This is one of your strongest areas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="domain-analysis">
            <h2>Domain Analysis</h2>
            <div className="domain-cards">
              {analysis.domain_scores && Object.entries(analysis.domain_scores).map(([domain, scores]) => (
                <div key={domain} className="domain-card">
                  <h3>{domain}</h3>
                  <div className="domain-score">
                    <span className="score-number">{scores.pct.toFixed(1)}%</span>
                    <span className="score-label">Readiness</span>
                  </div>
                  <div className="domain-skills">
                    <h4>Key Skills:</h4>
                    <div className="skills-tags">
                      {scores.top_skills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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

        .analysis-controls {
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
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          min-width: 200px;
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

        .analysis-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .skill-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .skill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .skill-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .skill-level {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .level-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .level-text {
          font-size: 1rem;
          color: #6b7280;
        }

        .skill-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-background {
          width: 100%;
          height: 100%;
        }

        .bar-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .skill-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .detail-item span:first-child {
          color: #6b7280;
        }

        .detail-item span:last-child {
          font-weight: 600;
          color: #1f2937;
        }

        .priority {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .priority.high {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #f87171;
        }

        .priority.medium {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fbbf24;
        }

        .priority.low {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #d97706;
        }

        .gaps-section {
          margin-bottom: 2rem;
        }

        .gaps-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .gap-item {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .gap-icon {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .gap-content h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .gap-content p {
          color: #374151;
          margin-bottom: 1rem;
        }

        .gap-recommendations h4 {
          font-size: 1rem;
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
          padding: 0.5rem 0;
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

        .strengths-section {
          margin-bottom: 2rem;
        }

        .strengths-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .strength-item {
          background: #dcfce7;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .strength-icon {
          font-size: 1.5rem;
        }

        .strength-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #166534;
          margin-bottom: 0.5rem;
        }

        .strength-content p {
          color: #166534;
          font-size: 0.875rem;
        }

        .domain-analysis {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .domain-analysis h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .domain-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .domain-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .domain-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .domain-score {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .score-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #3b82f6;
        }

        .score-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .domain-skills h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .analysis-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .skills-grid {
            grid-template-columns: 1fr;
          }

          .gaps-list {
            grid-template-columns: 1fr;
          }

          .strengths-list {
            grid-template-columns: 1fr;
          }

          .domain-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
