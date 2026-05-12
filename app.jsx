// src/App.jsx
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import Students from './pages/Students';
import './App.css';

const NAV = [
  { id: 'analyzer', label: 'Analyzer', icon: '◈' },
  { id: 'students', label: 'Students', icon: '⊞' },
  { id: 'dashboard', label: 'Dashboard', icon: '◉' },
];

export default function App() {
  const [page, setPage] = useState('analyzer');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">⬡</span>
          <div>
            <div className="brand-name">PlaceAI</div>
            <div className="brand-sub">Readiness Analyzer</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? 'active' : ''}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-badge">150 survey responses loaded</div>
        </div>
      </aside>

      <main className="main-content">
        {page === 'analyzer' && <Analyzer />}
        {page === 'students' && <Students />}
        {page === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
}