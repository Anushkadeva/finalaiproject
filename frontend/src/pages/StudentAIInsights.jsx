import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function StudentAIInsights({ user }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/ai-insights/${user.id}`);
      setInsights(response.insights || []);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title">AI Insights</div>
      <div className="page-sub">Personalized AI-powered insights about your career journey</div>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating personalized insights...</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>AI Insights Coming Soon</h3>
            <p>We're working on personalized AI insights for your career development!</p>
          </div>
        </div>
      )}
    </div>
  );
}
