// src/pages/Analytics.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    domainDistribution: {},
    readinessTrends: [],
    skillGaps: [],
    topSkills: [],
    placementPredictions: {}
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [studentsRes, analysesRes, predictionsRes] = await Promise.all([
        api.get('/students'),
        api.get('/analysis/results'),
        api.get('/ml/predictions')
      ]);

      const students = studentsRes;
      const analyses = analysesRes;
      const predictions = predictionsRes;

      // Domain distribution
      const domainCounts = {};
      analyses.forEach(a => {
        domainCounts[a.best_domain] = (domainCounts[a.best_domain] || 0) + 1;
      });

      // Readiness trends
      const readinessByMonth = {};
      analyses.forEach(a => {
        const month = new Date(a.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (!readinessByMonth[month]) {
          readinessByMonth[month] = [];
        }
        readinessByMonth[month].push(a.readiness_pct);
      });

      const trends = Object.keys(readinessByMonth).map(month => ({
        month,
        average: readinessByMonth[month].reduce((sum, score) => sum + score, 0) / readinessByMonth[month].length,
        count: readinessByMonth[month].length
      }));

      // Skill gaps analysis
      const skillGaps = [];
      const skillScores = {};
      
      students.forEach(student => {
        Object.keys(student).forEach(key => {
          if (key.includes('_rating') && typeof student[key] === 'number') {
            const skillName = key.replace('_rating', '');
            if (!skillScores[skillName]) {
              skillScores[skillName] = [];
            }
            skillScores[skillName].push(student[key]);
          }
        });
      });

      Object.keys(skillScores).forEach(skill => {
        const scores = skillScores[skill];
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        if (average < 3) {
          skillGaps.push({
            skill,
            average: average.toFixed(1),
            studentsBelow3: scores.filter(s => s < 3).length
          });
        }
      });

      // Top skills
      const topSkills = Object.keys(skillScores)
        .map(skill => ({
          skill,
          average: skillScores[skill].reduce((sum, score) => sum + score, 0) / skillScores[skill].length
        }))
        .sort((a, b) => b.average - a.average)
        .slice(0, 10);

      setAnalytics({
        domainDistribution: domainCounts,
        readinessTrends: trends,
        skillGaps: skillGaps.slice(0, 5),
        topSkills,
        placementPredictions: predictions
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Comprehensive analytics and insights for the placement system</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-section">
          <h2>Domain Distribution</h2>
          <div className="domain-cards">
            {Object.entries(analytics.domainDistribution).map(([domain, count]) => (
              <div key={domain} className="domain-card">
                <h3>{domain}</h3>
                <div className="domain-count">{count} students</div>
                <div className="domain-bar">
                  <div 
                    className="domain-fill" 
                    style={{ 
                      width: `${(count / Math.max(...Object.values(analytics.domainDistribution))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h2>Readiness Trends</h2>
          <div className="trend-chart">
            {analytics.readinessTrends.map((trend, index) => (
              <div key={trend.month} className="trend-item">
                <div className="trend-month">{trend.month}</div>
                <div className="trend-bar">
                  <div 
                    className="trend-fill" 
                    style={{ 
                      height: `${trend.average}%`,
                      backgroundColor: trend.average >= 70 ? '#10b981' : trend.average >= 50 ? '#3b82f6' : '#f59e0b'
                    }}
                  ></div>
                </div>
                <div className="trend-value">{trend.average.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h2>Top Skills</h2>
          <div className="skills-list">
            {analytics.topSkills.map((skill, index) => (
              <div key={skill.skill} className="skill-item">
                <div className="skill-rank">#{index + 1}</div>
                <div className="skill-info">
                  <div className="skill-name">{skill.skill.replace(/_/g, ' ').toUpperCase()}</div>
                  <div className="skill-average">{skill.average.toFixed(1)}/5.0</div>
                </div>
                <div className="skill-bar">
                  <div 
                    className="skill-fill" 
                    style={{ 
                      width: `${(skill.average / 5) * 100}%`,
                      backgroundColor: skill.average >= 4 ? '#10b981' : skill.average >= 3 ? '#3b82f6' : '#f59e0b'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h2>Skill Gaps</h2>
          <div className="gaps-list">
            {analytics.skillGaps.map((gap, index) => (
              <div key={gap.skill} className="gap-item">
                <div className="gap-icon">⚠️</div>
                <div className="gap-info">
                  <div className="gap-skill">{gap.skill.replace(/_/g, ' ').toUpperCase()}</div>
                  <div className="gap-stats">
                    <span>Avg: {gap.average}/5.0</span>
                    <span>{gap.studentsBelow3} students below 3.0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .analytics-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .analytics-section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .domain-cards {
          display: grid;
          gap: 1rem;
        }

        .domain-card {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .domain-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .domain-count {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.75rem;
        }

        .domain-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .domain-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .trend-chart {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          height: 200px;
          padding: 1rem 0;
        }

        .trend-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .trend-month {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .trend-bar {
          width: 20px;
          height: 100px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .trend-fill {
          width: 100%;
          transition: height 0.3s ease;
        }

        .trend-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: #1f2937;
        }

        .skills-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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

        .skill-average {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .skill-bar {
          width: 60px;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .skill-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .gaps-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .gap-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
        }

        .gap-icon {
          font-size: 1.5rem;
        }

        .gap-info {
          flex: 1;
        }

        .gap-skill {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .gap-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .trend-chart {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
