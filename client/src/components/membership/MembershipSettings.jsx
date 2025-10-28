import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const MembershipSettings = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    autoApproveApplications: false,
    enableApplicationForm: true,
    allowBankTransfers: true,
    invoiceText: '',
    emailNotifications: {
      newApplication: true,
      paymentReceived: true,
      subscriptionExpiring: true
    }
  });

  const handleSave = () => {
    alert(t('settings.saved.successfully'));
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>{t('settings.title')}</h2>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>{t('settings.general.settings')}</h3>
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.autoApproveApplications}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  autoApproveApplications: e.target.checked
                }))}
              />
              <span className="toggle-slider"></span>
              {t('settings.auto.approve')}
            </label>
          </div>
          
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.enableApplicationForm}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  enableApplicationForm: e.target.checked
                }))}
              />
              <span className="toggle-slider"></span>
              {t('settings.enable.form')}
            </label>
          </div>
          
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.allowBankTransfers}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  allowBankTransfers: e.target.checked
                }))}
              />
              <span className="toggle-slider"></span>
              {t('settings.allow.bank.transfers')}
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>{t('settings.invoice.text')}</h3>
          <textarea
            value={settings.invoiceText}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              invoiceText: e.target.value
            }))}
            placeholder={t('settings.invoice.text.placeholder')}
            rows="4"
          />
        </div>

        <div className="settings-section">
          <h3>{t('settings.email.notifications')}</h3>
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications.newApplication}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  emailNotifications: {
                    ...prev.emailNotifications,
                    newApplication: e.target.checked
                  }
                }))}
              />
              <span className="toggle-slider"></span>
              {t('settings.new.application.notifications')}
            </label>
          </div>
          
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications.paymentReceived}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  emailNotifications: {
                    ...prev.emailNotifications,
                    paymentReceived: e.target.checked
                  }
                }))}
              />
              <span className="toggle-slider"></span>
              {t('settings.payment.received.notifications')}
            </label>
          </div>
          
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications.subscriptionExpiring}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  emailNotifications: {
                    ...prev.emailNotifications,
                    subscriptionExpiring: e.target.checked
                  }
                }))}
              />
              <span className="toggle-slider"></span>
              {t('settings.subscription.expiring.notifications')}
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button onClick={handleSave} className="save-button">
            <i className="fas fa-save"></i> {t('settings.save.settings')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .settings-container {
          padding: 30px;
        }

        .settings-header h2 {
          margin: 0 0 30px 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .settings-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 30px;
        }

        .settings-section {
          margin-bottom: 40px;
        }

        .settings-section:last-child {
          margin-bottom: 0;
        }

        .settings-section h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.2rem;
          border-bottom: 1px solid #ecf0f1;
          padding-bottom: 10px;
        }

        .setting-item {
          margin-bottom: 15px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 1rem;
          color: #34495e;
        }

        .toggle-label input {
          display: none;
        }

        .toggle-slider {
          width: 50px;
          height: 24px;
          background-color: #ccc;
          border-radius: 24px;
          margin-right: 15px;
          position: relative;
          transition: background-color 0.3s;
        }

        .toggle-slider:before {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          background-color: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }

        .toggle-label input:checked + .toggle-slider {
          background-color: #27ae60;
        }

        .toggle-label input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
        }

        .settings-actions {
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
          text-align: right;
        }

        .save-button {
          background: #27ae60;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 1rem;
          transition: background 0.3s ease;
        }

        .save-button:hover {
          background: #219a52;
        }

        .save-button i {
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};

export default MembershipSettings;
