// src/services/api.js
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Students
  getStudents: () => request('/students'),
  getStudent: (id) => request(`/students/${id}`),
  createStudent: (data) => request('/students', { method: 'POST', body: data }),
  updateStudent: (id, data) => request(`/students/${id}`, { method: 'PUT', body: data }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),

  // Analysis
  analyzeStudent: (id) => request(`/analyze/${id}`, { method: 'POST' }),
  quickAnalyze: (data) => request('/analyze/quick', { method: 'POST', body: data }),
  getResults: (id) => request(`/results/${id}`),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),
  getRoles: () => request('/roles'),
};