import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import Students from './pages/Students';
import StudentReport from './pages/StudentReport';
import JobRecommendations from './pages/JobRecommendations';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import LearningRoadmap from './pages/LearningRoadmap';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AIInsights from './pages/AIInsights';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import PlacementReports from './pages/PlacementReports';
import AdminSkillGapAnalytics from './pages/AdminSkillGapAnalytics';
import DomainStatistics from './pages/DomainStatistics';
import ExportReports from './pages/ExportReports';
import ManageRoles from './pages/ManageRoles';
import SystemSettings from './pages/SystemSettings';
import StudentDashboard from './pages/StudentDashboard';
import StudentJobRecommendations from './pages/StudentJobRecommendations';
import StudentSkillAnalysis from './pages/StudentSkillAnalysis';
import StudentLearningRoadmap from './pages/StudentLearningRoadmap';
import StudentAIInsights from './pages/StudentAIInsights';
import './App.css';

const ADMIN_NAV = [
  { id: 'admin_dashboard', label: 'Admin Dashboard', icon: '🏠' },
  { id: 'students', label: 'Student Management', icon: '👥' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'placement_reports', label: 'Placement Reports', icon: '�' },
  { id: 'skill_gap_analytics', label: 'Skill Gap Analytics', icon: '�' },
  { id: 'domain_statistics', label: 'Domain Statistics', icon: '📈' },
  { id: 'export_reports', label: 'Export Reports', icon: '📤' },
  { id: 'manage_roles', label: 'Manage Roles', icon: '🔐' },
  { id: 'system_settings', label: 'System Settings', icon: '⚙️' },
];

const STUDENT_NAV = [
  { id: 'student_dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'placement_analyzer', label: 'Placement Analyzer', icon: '📊' },
  { id: 'resume_analyzer', label: 'Resume Analyzer', icon: '📄' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(null);

  const handleLogin = (u) => {
    setUser(u);
    setPage(u.role === 'admin' ? 'admin_dashboard' : 'student_dashboard');
  };

  const handleLogout = () => { setUser(null); setPage(null); };

  if (!user) return <Login onLogin={handleLogin} />;

  const isAdmin   = user.role === 'admin';
  const NAV       = isAdmin ? ADMIN_NAV : STUDENT_NAV;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">⬡</span>
          <div>
            <div className="brand-name">PlaceAI</div>
            <div className="brand-sub">{isAdmin ? 'Admin Panel' : 'Student Portal'}</div>
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
          <div className={`sidebar-badge ${isAdmin ? 'admin-badge' : ''}`}>
            {isAdmin ? '🛡️ Admin' : '🎓 Student'} · {user.name}
          </div>
          <button className="btn btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        {/* Admin pages */}
        {isAdmin && page === 'admin_dashboard' && <AdminDashboard onNavigate={setPage} />}
        {isAdmin && page === 'students' && <Students />}
        {isAdmin && page === 'analytics' && <Analytics />}
        {isAdmin && page === 'placement_reports' && <PlacementReports onNavigate={setPage} />}
        {isAdmin && page === 'skill_gap_analytics' && <AdminSkillGapAnalytics />}
        {isAdmin && page === 'domain_statistics' && <DomainStatistics />}
        {isAdmin && page === 'export_reports' && <ExportReports />}
        {isAdmin && page === 'manage_roles' && <ManageRoles />}
        {isAdmin && page === 'system_settings' && <SystemSettings />}

        {/* Student pages */}
        {!isAdmin && page === 'student_dashboard' && <StudentDashboard user={user} />}
        {!isAdmin && page === 'placement_analyzer' && <Analyzer user={user} />}
        {!isAdmin && page === 'resume_analyzer' && <ResumeAnalyzer user={user} />}
        {!isAdmin && page === 'profile' && <StudentProfile user={user} />}
      </main>
    </div>
  );
}

// Simple profile page for students
function StudentProfile({ user }) {
  return (
    <div>
      <div className="page-title">My Profile</div>
      <div className="page-sub">Your account information</div>
      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="student-welcome" style={{ marginBottom: 0 }}>
            <div className="welcome-avatar">🎓</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{user.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>{user.email}</div>
            </div>
          </div>
          <div className="divider" />
          {[
            ['Role', 'Student'],
            ['Email', user.email],
            ['Access', 'Analyzer · My Report · Profile'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: 11 }}>{k}</span>
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
