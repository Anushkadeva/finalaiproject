// src/pages/ManageRoles.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ManageRoles() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      await api.post('/users', userData);
      fetchUsers();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Roles</h1>
        <p>Manage user roles and permissions</p>
      </div>

      <div className="roles-controls">
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          ➕ Add New User
        </button>
        <button className="btn btn-secondary" onClick={fetchUsers}>
          🔄 Refresh
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button 
                className="btn btn-close"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            <AddUserForm onSubmit={handleAddUser} />
          </div>
        </div>
      )}

      <div className="users-table">
        <div className="table-header">
          <h3>User Management ({users.length} users)</h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {editingUser === user.id ? (
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span 
                        className={`role-badge ${user.role}`}
                        onClick={() => setEditingUser(user.id)}
                      >
                        {user.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}
                      </span>
                    )}
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                      >
                        {editingUser === user.id ? '💾 Save' : '✏️ Edit'}
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="role-summary">
        <h3>Role Summary</h3>
        <div className="summary-cards">
          <div className="summary-card admin">
            <div className="card-icon">🛡️</div>
            <div className="card-content">
              <h4>Admin Users</h4>
              <div className="card-value">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </div>
          </div>

          <div className="summary-card student">
            <div className="card-icon">🎓</div>
            <div className="card-content">
              <h4>Student Users</h4>
              <div className="card-value">
                {users.filter(u => u.role === 'student').length}
              </div>
            </div>
          </div>

          <div className="summary-card total">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <h4>Total Users</h4>
              <div className="card-value">{users.length}</div>
            </div>
          </div>
        </div>
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

        .roles-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
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

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
        }

        .btn-outline {
          background: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }

        .btn-outline:hover {
          background: #f9fafb;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .users-table {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .table-header {
          padding: 1.5rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #f9fafb;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.875rem;
        }

        .data-table tr:hover {
          background: #f9fafb;
        }

        .role-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .role-badge.admin {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fbbf24;
        }

        .role-badge.student {
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }

        .role-badge:hover {
          transform: scale(1.05);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .role-summary {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .role-summary h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .summary-card.admin {
          background: #fef3c7;
          border-color: #fbbf24;
        }

        .summary-card.student {
          background: #dbeafe;
          border-color: #93c5fd;
        }

        .summary-card.total {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .card-icon {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
        }

        .card-content h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.25rem;
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .roles-controls {
            flex-direction: column;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .table-container {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

// Add User Form Component
function AddUserForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Role:</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
          className="form-input"
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          className="form-input"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          ➕ Add User
        </button>
        <button type="button" className="btn btn-secondary">
          Cancel
        </button>
      </div>

      <style jsx>{`
        .user-form {
          display: flex;
          flex-direction: column;
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
          font-size: 0.875rem;
        }

        .form-input {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
      `}</style>
    </form>
  );
}
