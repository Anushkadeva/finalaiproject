import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function StudentJobRecommendations({ user }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/job-recommendations/${user.id}`);
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching job recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title">Job Recommendations</div>
      <div className="page-sub">Personalized job opportunities based on your skills and preferences</div>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing your profile and finding matching jobs...</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>Job Recommendations Coming Soon</h3>
            <p>We're working on personalized job recommendations for you!</p>
          </div>
        </div>
      )}
    </div>
  );
}
