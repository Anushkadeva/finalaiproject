// src/pages/SystemSettings.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    system_name: 'PlaceAI',
    admin_email: 'admin@placeai.com',
    readiness_threshold: 60,
    ml_model_refresh: 'daily',
    backup_enabled: true,
    notification_enabled: true,
    max_file_size: 10,
    session_timeout: 30,
    maintenance_mode: false
  });

  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings({...settings, [key]: value});
  };

  const saveSettings = async () => {
    try {
      await api.put('/settings', settings);
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Error saving settings');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({
        system_name: 'PlaceAI',
        admin_email: 'admin@placeai.com',
        readiness_threshold: 60,
        ml_model_refresh: 'daily',
        backup_enabled: true,
        notification_enabled: true,
        max_file_size: 10,
        session_timeout: 30,
        maintenance_mode: false
      });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>System Settings</h1>
        <p>Configure system-wide settings and preferences</p>
      </div>

      {saveStatus && (
        <div className={`alert ${saveStatus.includes('success') ? 'success' : 'error'}`}>
          {saveStatus}
        </div>
      )}

      <div className="settings-container">
        <div className="settings-section">
          <h2>General Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label>System Name:</label>
              <input
                type="text"
                value={settings.system_name}
                onChange={(e) => handleSettingChange('system_name', e.target.value)}
                className="setting-input"
              />
            </div>

            <div className="setting-item">
              <label>Admin Email:</label>
              <input
                type="email"
                value={settings.admin_email}
                onChange={(e) => handleSettingChange('admin_email', e.target.value)}
                className="setting-input"
              />
            </div>

            <div className="setting-item">
              <label>Maintenance Mode:</label>
              <div className="toggle-container">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode}
                    onChange={(e) => handleSettingChange('maintenance_mode', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">
                  {settings.maintenance_mode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Placement Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Readiness Threshold (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.readiness_threshold}
                onChange={(e) => handleSettingChange('readiness_threshold', parseInt(e.target.value))}
                className="setting-input"
              />
            </div>

            <div className="setting-item">
              <label>ML Model Refresh:</label>
              <select
                value={settings.ml_model_refresh}
                onChange={(e) => handleSettingChange('ml_model_refresh', e.target.value)}
                className="setting-select"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>File & Upload Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Max File Size (MB):</label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.max_file_size}
                onChange={(e) => handleSettingChange('max_file_size', parseInt(e.target.value))}
                className="setting-input"
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Security Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Session Timeout (minutes):</label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings.session_timeout}
                onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
                className="setting-input"
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notification Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Enable Notifications:</label>
              <div className="toggle-container">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.notification_enabled}
                    onChange={(e) => handleSettingChange('notification_enabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">
                  {settings.notification_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="setting-item">
              <label>Enable Backups:</label>
              <div className="toggle-container">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.backup_enabled}
                    onChange={(e) => handleSettingChange('backup_enabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">
                  {settings.backup_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-primary" onClick={saveSettings}>
          💾 Save Settings
        </button>
        <button className="btn btn-secondary" onClick={resetToDefaults}>
          🔄 Reset to Defaults
        </button>
      </div>

      <div className="settings-info">
        <h3>System Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Version:</span>
            <span className="info-value">2.0.0</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Updated:</span>
            <span className="info-value">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Database:</span>
            <span className="info-value">SQLite</span>
          </div>
          <div className="info-item">
            <span className="info-label">Environment:</span>
            <span className="info-value">Development</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          padding: 2rem;
          max-width: 1000px;
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

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .alert.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .alert.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .settings-container {
          display: grid;
          gap: 2rem;
        }

        .settings-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .settings-section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .setting-item label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .setting-input,
        .setting-select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
        }

        .setting-input:focus,
        .setting-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .toggle-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .toggle {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #d1d5db;
          transition: 0.4s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        .toggle input:checked + .toggle-slider {
          background-color: #3b82f6;
        }

        .toggle input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .toggle-label {
          font-weight: 500;
          color: #374151;
        }

        .settings-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
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

        .settings-info {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          margin-top: 2rem;
        }

        .settings-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .info-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .info-value {
          font-weight: 500;
          color: #6b7280;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .settings-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
