// src/pages/ResumeAnalyzer.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ResumeAnalyzer({ user }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(user?.id || '');
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!user) {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      const response = await api.getStudents();
      setStudents(response);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const studentId = user?.id || selectedStudent;
    
    if (!file || !studentId) {
      alert('Please select a student and a file');
      return;
    }

    if (!file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('student_id', studentId);

    try {
      const response = await api.post('/resume/upload', formData);
      setAnalysis(response);
      setUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert(error.message || 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Resume Analyzer</h1>
        <p>Upload and analyze your resume with AI-powered insights</p>
      </div>

      <div className="content-card">
        <div className="upload-section">
          <div className="form-row">
            {!user && (
              <div className="form-group">
                <label>Select Student:</label>
                <select 
                  value={selectedStudent} 
                  onChange={(e) => setSelectedStudent(e.target.value)}
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
            )}

            <div className="form-group">
              <label>Upload Resume (PDF):</label>
              <input 
                type="file" 
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={!selectedStudent || uploading}
                className="file-input"
              />
            </div>
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p>Uploading and analyzing... {uploadProgress}%</p>
            </div>
          )}
        </div>

        {analysis && (
          <div className="analysis-results">
            <div className="score-overview">
              <h2>Resume Score Analysis</h2>
              <div className="score-grid">
                <div className="score-card">
                  <div className="score-circle" style={{ color: getScoreColor(analysis.scores.overall) }}>
                    {Math.round(analysis.scores.overall)}
                  </div>
                  <div className="score-details">
                    <h3>Overall Score</h3>
                    <p>{getScoreLabel(analysis.scores.overall)}</p>
                  </div>
                </div>

                <div className="score-breakdown">
                  <div className="score-item">
                    <span>Completeness</span>
                    <div className="mini-score" style={{ color: getScoreColor(analysis.scores.completeness) }}>
                      {Math.round(analysis.scores.completeness)}%
                    </div>
                  </div>
                  <div className="score-item">
                    <span>Skill Relevance</span>
                    <div className="mini-score" style={{ color: getScoreColor(analysis.scores.skill_relevance) }}>
                      {Math.round(analysis.scores.skill_relevance)}%
                    </div>
                  </div>
                  <div className="score-item">
                    <span>Format</span>
                    <div className="mini-score" style={{ color: getScoreColor(analysis.scores.format) }}>
                      {Math.round(analysis.scores.format)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="skills-analysis">
              <h2>Extracted Skills</h2>
              <div className="skills-grid">
                <div className="skill-category">
                  <h3>Technical Skills</h3>
                  <div className="skill-tags">
                    {analysis.extracted_skills.technical.map((skill, i) => (
                      <span key={i} className="skill-tag technical">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="skill-category">
                  <h3>Soft Skills</h3>
                  <div className="skill-tags">
                    {analysis.extracted_skills.soft.map((skill, i) => (
                      <span key={i} className="skill-tag soft">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="skill-category">
                  <h3>Tools</h3>
                  <div className="skill-tags">
                    {analysis.extracted_skills.tools.map((skill, i) => (
                      <span key={i} className="skill-tag tools">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="keywords-analysis">
              <div className="keywords-section">
                <h3>Strength Keywords</h3>
                <div className="keywords-list">
                  {analysis.strength_keywords.map((keyword, i) => (
                    <span key={i} className="keyword strength">{keyword}</span>
                  ))}
                </div>
              </div>

              <div className="keywords-section">
                <h3>Missing Keywords</h3>
                <div className="keywords-list">
                  {analysis.missing_keywords.map((keyword, i) => (
                    <span key={i} className="keyword missing">{keyword}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="improvement-suggestions">
              <h2>Improvement Suggestions</h2>
              <div className="suggestions-list">
                {analysis.suggestions.map((suggestion, i) => (
                  <div key={i} className="suggestion-item">
                    <div className="suggestion-number">{i + 1}</div>
                    <div className="suggestion-text">{suggestion}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sentiment-analysis">
              <h2>Resume Sentiment Analysis</h2>
              <div className="sentiment-metrics">
                <div className="sentiment-item">
                  <span>Confidence Level:</span>
                  <span className="sentiment-value">{analysis.sentiment.confidence_level}</span>
                </div>
                <div className="sentiment-item">
                  <span>Polarity:</span>
                  <span className="sentiment-value">{analysis.sentiment.polarity.toFixed(2)}</span>
                </div>
                <div className="sentiment-item">
                  <span>Subjectivity:</span>
                  <span className="sentiment-value">{analysis.sentiment.subjectivity.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!analysis && !uploading && (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No Resume Analysis Yet</h3>
            <p>Select a student and upload their resume to get AI-powered insights</p>
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

        .upload-section {
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

        .form-select, .file-input {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
        }

        .file-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .upload-progress {
          text-align: center;
          padding: 2rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .analysis-results h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .score-overview {
          margin-bottom: 2rem;
        }

        .score-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .score-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 12px;
        }

        .score-circle {
          font-size: 2.5rem;
          font-weight: 700;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 3px solid currentColor;
        }

        .score-details h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .score-details p {
          color: #6b7280;
        }

        .score-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .score-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .mini-score {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .skills-analysis {
          margin-bottom: 2rem;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .skill-category h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
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

        .skill-tag.technical {
          background: #dbeafe;
          color: #1e40af;
        }

        .skill-tag.soft {
          background: #dcfce7;
          color: #166534;
        }

        .skill-tag.tools {
          background: #fef3c7;
          color: #92400e;
        }

        .keywords-analysis {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .keywords-section h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .keyword {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .keyword.strength {
          background: #dcfce7;
          color: #166534;
        }

        .keyword.missing {
          background: #fee2e2;
          color: #991b1b;
        }

        .improvement-suggestions {
          margin-bottom: 2rem;
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .suggestion-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .suggestion-number {
          width: 24px;
          height: 24px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .suggestion-text {
          color: #374151;
          line-height: 1.5;
        }

        .sentiment-analysis {
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .sentiment-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .sentiment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: white;
          border-radius: 6px;
        }

        .sentiment-value {
          font-weight: 600;
          color: #1f2937;
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

          .score-grid {
            grid-template-columns: 1fr;
          }

          .keywords-analysis {
            grid-template-columns: 1fr;
          }

          .sentiment-metrics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
