// src/pages/LearningRoadmap.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function LearningRoadmap() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [roadmap, setRoadmap] = useState([]);
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

  const fetchRoadmap = async () => {
    if (!selectedStudent) return;
    
    setLoading(true);
    try {
      const url = selectedDomain 
        ? `/learning/roadmap/${selectedStudent}?domain=${selectedDomain}`
        : `/learning/roadmap/${selectedStudent}`;
      
      const response = await api.get(url);
      setRoadmap(response.data);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      fetchRoadmap();
    }
  }, [selectedStudent, selectedDomain]);

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    if (!studentId) {
      setRoadmap([]);
    }
  };

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
  };

  const getWeekColor = (week) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[(week - 1) % colors.length];
  };

  const exportRoadmap = () => {
    const roadmapText = roadmap.map((week, index) => {
      let text = `Week ${week.week}: ${week.focus_area}\n`;
      text += `Skills: ${week.skills.join(', ')}\n`;
      text += `Resources: ${week.resources.join(', ')}\n`;
      text += `Projects: ${week.projects.join(', ')}\n`;
      text += `Certifications: ${week.certifications.join(', ')}\n`;
      if (week.priority_gaps) {
        text += `Priority Gaps: ${week.priority_gaps.join(', ')}\n`;
      }
      text += '\n';
      return text;
    }).join('\n');

    const blob = new Blob([roadmapText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-roadmap-${selectedStudent}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Personalized Learning Roadmap</h1>
        <p>Get a customized 6-week learning plan to bridge your skill gaps</p>
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
            <p>Generating your personalized learning roadmap...</p>
          </div>
        )}

        {roadmap.length > 0 && !loading && (
          <div className="roadmap-container">
            <div className="roadmap-header">
              <h2>Your 6-Week Learning Journey</h2>
              <button onClick={exportRoadmap} className="export-btn">
                📥 Export Roadmap
              </button>
            </div>

            <div className="roadmap-timeline">
              {roadmap.map((week, index) => (
                <div key={index} className="week-card">
                  <div className="week-header" style={{ borderColor: getWeekColor(week.week) }}>
                    <div className="week-number" style={{ backgroundColor: getWeekColor(week.week) }}>
                      Week {week.week}
                    </div>
                    <div className="week-title">
                      <h3>{week.focus_area}</h3>
                      {week.priority_gaps && (
                        <div className="priority-gaps">
                          <span className="gaps-label">Focus Areas:</span>
                          <div className="gaps-tags">
                            {week.priority_gaps.map((gap, i) => (
                              <span key={i} className="gap-tag">{gap}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="week-content">
                    <div className="content-section">
                      <h4>🎯 Skills to Learn</h4>
                      <ul className="skill-list">
                        {week.skills.map((skill, i) => (
                          <li key={i}>{skill}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="content-section">
                      <h4>📚 Learning Resources</h4>
                      <ul className="resource-list">
                        {week.resources.map((resource, i) => (
                          <li key={i}>{resource}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="content-section">
                      <h4>🏗️ Practice Projects</h4>
                      <ul className="project-list">
                        {week.projects.map((project, i) => (
                          <li key={i}>{project}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="content-section">
                      <h4>🏆 Recommended Certifications</h4>
                      <ul className="cert-list">
                        {week.certifications.map((cert, i) => (
                          <li key={i}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="roadmap-summary">
              <h3>Learning Journey Summary</h3>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-icon">📈</div>
                  <div className="summary-content">
                    <h4>Progressive Learning</h4>
                    <p>Each week builds on previous concepts for steady skill development</p>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">🎯</div>
                  <div className="summary-content">
                    <h4>Goal-Oriented</h4>
                    <p>Focus on industry-relevant skills that match job requirements</p>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">🏆</div>
                  <div className="summary-content">
                    <h4>Certification Ready</h4>
                    <p>Prepare for professional certifications to validate your skills</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedStudent && roadmap.length === 0 && !loading && (
          <div className="empty-state">
            <p>No learning roadmap available.</p>
            <p>Make sure the student has skill assessments completed.</p>
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

        .roadmap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .roadmap-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .export-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .export-btn:hover {
          background: #2563eb;
        }

        .roadmap-timeline {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .week-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .week-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .week-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-left: 4px solid;
          border-bottom: 1px solid #e5e7eb;
        }

        .week-number {
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .week-title h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .priority-gaps {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .gaps-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 600;
        }

        .gaps-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .gap-tag {
          background: #fef3c7;
          color: #92400e;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .week-content {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .content-section h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .skill-list,
        .resource-list,
        .project-list,
        .cert-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .skill-list li,
        .resource-list li,
        .project-list li,
        .cert-list li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
          position: relative;
          padding-left: 1.5rem;
        }

        .skill-list li:before,
        .resource-list li:before,
        .project-list li:before,
        .cert-list li:before {
          content: "▸";
          position: absolute;
          left: 0;
          color: #3b82f6;
          font-weight: bold;
        }

        .roadmap-summary {
          margin-top: 3rem;
          padding: 2rem;
          background: #f9fafb;
          border-radius: 12px;
        }

        .roadmap-summary h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .summary-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .summary-icon {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 50%;
        }

        .summary-content h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .summary-content p {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
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

          .roadmap-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .week-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .week-content {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
