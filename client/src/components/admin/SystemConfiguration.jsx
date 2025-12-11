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
      <div key={setting.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-1">{setting.key}</h4>
            {setting.description && (
              <p className="text-sm text-gray-600">{setting.description}</p>
            )}
          </div>
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
            setting.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {setting.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">{valueDisplay}</pre>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-sm font-medium text-[#3498db] border border-[#3498db] rounded-lg hover:bg-[#3498db] hover:text-white transition-colors"
            onClick={() => handleEditSetting(setting)}
          >
            {t('admin.system.edit') || 'Edit'}
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            onClick={() => handleDeleteSetting(setting)}
          >
            {t('admin.system.delete') || 'Delete'}
          </button>
        </div>
      </div>
    );
  };

  const renderSettingsSection = (type, title, description, iconType) => {
    const typeSettings = settings[type] || [];
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            {getSectionIcon(iconType)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {typeSettings.length > 0 ? (
            typeSettings.map(setting => renderSettingCard(setting))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No {type} settings configured yet.
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db] mb-4"></div>
          <p className="text-gray-600">Loading system configuration...</p>
        </div>
      </div>
    );
  }

  const getSectionIcon = (type) => {
    const iconClass = "w-6 h-6";
    switch(type) {
      case 'platform':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'email':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'notification':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      case 'feature':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'security':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="system-configuration">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('admin.system.title') || 'System Configuration'}
        </h1>
        <p className="text-gray-600">
          {t('admin.system.description') || 'Manage platform settings, email templates, notifications, and security configurations'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {renderSettingsSection(
        'platform',
        t('admin.system.platform.settings'),
        t('admin.system.site.description'),
        'platform'
      )}

      {renderSettingsSection(
        'email',
        t('admin.system.email.templates'),
        t('admin.system.email.description'),
        'email'
      )}

      {renderSettingsSection(
        'notification',
        t('admin.system.notification.settings'),
        t('admin.system.notification.description'),
        'notification'
      )}

      {renderSettingsSection(
        'feature',
        t('admin.system.feature.flags'),
        t('admin.system.feature.description'),
        'feature'
      )}

      {renderSettingsSection(
        'security',
        t('admin.system.security.settings'),
        t('admin.system.security.description'),
        'security'
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
