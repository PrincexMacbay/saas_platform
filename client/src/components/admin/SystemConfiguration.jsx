import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmDialog from '../ConfirmDialog';
import './SystemConfiguration.css';

const SystemConfiguration = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    platform: [],
    email: [],
    notification: [],
    feature: [],
    security: []
  });
  const [editingSetting, setEditingSetting] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [settingForm, setSettingForm] = useState({
    key: '',
    value: '',
    type: 'platform',
    description: '',
    isActive: true
  });
  const { t } = useLanguage();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSystemSettings();
      console.log('✅ System settings fetched:', response);
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSetting = (setting) => {
    setEditingSetting(setting);
    setSettingForm({
      key: setting.key,
      value: typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value),
      type: setting.type,
      description: setting.description || '',
      isActive: setting.isActive
    });
    setShowEditModal(true);
  };

  const handleSaveSetting = async () => {
    try {
      await adminService.updateSystemSetting(settingForm);
      setShowEditModal(false);
      setEditingSetting(null);
      fetchSettings();
    } catch (err) {
      console.error('Error saving setting:', err);
      setError('Failed to save setting');
    }
  };

  const handleDeleteSetting = (setting) => {
    setConfirmDialog({
      message: `Are you sure you want to delete the setting "${setting.key}"?`,
      onConfirm: async () => {
        try {
          await adminService.deleteSystemSetting(setting.id);
          fetchSettings();
          setConfirmDialog(null);
        } catch (err) {
          console.error('Error deleting setting:', err);
          setError('Failed to delete setting');
          setConfirmDialog(null);
        }
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const renderSettingCard = (setting) => {
    let valueDisplay = setting.value;
    try {
      const parsed = JSON.parse(setting.value);
      if (typeof parsed === 'object') {
        valueDisplay = JSON.stringify(parsed, null, 2);
      } else {
        valueDisplay = parsed;
      }
    } catch (e) {
      valueDisplay = setting.value;
    }

    return (
      <div key={setting.id} className="setting-card">
        <div className="setting-header">
          <h4>{setting.key}</h4>
          <span className={`badge ${setting.isActive ? 'badge-success' : 'badge-inactive'}`}>
            {setting.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {setting.description && (
          <p className="setting-description">{setting.description}</p>
        )}
        <div className="setting-value">
          <pre>{valueDisplay}</pre>
        </div>
        <div className="setting-actions">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => handleEditSetting(setting)}
          >
            {t('admin.system.edit')}
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDeleteSetting(setting)}
          >
            {t('admin.system.delete')}
          </button>
        </div>
      </div>
    );
  };

  const renderSettingsSection = (type, title, description, icon) => {
    const typeSettings = settings[type] || [];
    return (
      <div className="chart-container">
        <div className="section-header">
          <div className="section-icon">{icon}</div>
          <div className="section-info">
            <h3 className="chart-title">{title}</h3>
            <p className="section-description">{description}</p>
          </div>
        </div>
        <div className="settings-list">
          {typeSettings.length > 0 ? (
            typeSettings.map(setting => renderSettingCard(setting))
          ) : (
            <div className="empty-state">
              <p>No {type} settings configured yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="system-configuration">
        <div className="loading">Loading system configuration...</div>
      </div>
    );
  }

  return (
    <div className="system-configuration">
      <div className="management-header">
        <h2>{t('admin.system.title')}</h2>
        <p>{t('admin.system.description')}</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {renderSettingsSection(
        'platform',
        t('admin.system.platform.settings'),
        t('admin.system.site.description'),
        '⚙️'
      )}

      {renderSettingsSection(
        'email',
        t('admin.system.email.templates'),
        t('admin.system.email.description'),
        '📧'
      )}

      {renderSettingsSection(
        'notification',
        t('admin.system.notification.settings'),
        t('admin.system.notification.description'),
        '🔔'
      )}

      {renderSettingsSection(
        'feature',
        t('admin.system.feature.flags'),
        t('admin.system.feature.description'),
        '🚩'
      )}

      {renderSettingsSection(
        'security',
        t('admin.system.security.settings'),
        t('admin.system.security.description'),
        '🔒'
      )}

      {/* Edit Setting Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('admin.system.edit.setting')}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSetting(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Setting Key</label>
                <input
                  type="text"
                  value={settingForm.key}
                  onChange={(e) => setSettingForm(prev => ({ ...prev, key: e.target.value }))}
                  disabled={editingSetting}
                  placeholder="e.g., site_name"
                />
              </div>
              <div className="form-group">
                <label>Setting Value</label>
                <textarea
                  value={settingForm.value}
                  onChange={(e) => setSettingForm(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter setting value or JSON"
                  rows={6}
                />
              </div>
              <div className="form-group">
                <label>Setting Type</label>
                <select
                  value={settingForm.type}
                  onChange={(e) => setSettingForm(prev => ({ ...prev, type: e.target.value }))}
                  disabled={editingSetting}
                >
                  <option value="platform">Platform</option>
                  <option value="email">Email</option>
                  <option value="notification">Notification</option>
                  <option value="feature">Feature</option>
                  <option value="security">Security</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={settingForm.description}
                  onChange={(e) => setSettingForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settingForm.isActive}
                    onChange={(e) => setSettingForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSetting(null);
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveSetting}
              >
                {t('admin.system.save.setting')}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
  );
};

export default SystemConfiguration;
