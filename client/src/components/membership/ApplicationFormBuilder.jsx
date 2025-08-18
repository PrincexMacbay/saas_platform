import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ApplicationFormBuilder = () => {
  const [formConfig, setFormConfig] = useState({
    title: 'Membership Application',
    description: '',
    footer: '',
    terms: '',
    agreement: '',
    fields: [],
    isPublished: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOrganizationSelector, setShowOrganizationSelector] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [joiningOrganization, setJoiningOrganization] = useState(false);

  useEffect(() => {
    fetchFormConfig();
  }, []);

  const fetchFormConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/membership/application-form');
      setFormConfig(response.data.data);
      setShowOrganizationSelector(false);
    } catch (error) {
      console.error('Error fetching form config:', error);
      if (error.response?.data?.code === 'NO_ORGANIZATION') {
        setShowOrganizationSelector(true);
        await fetchOrganizations();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/users/organizations/available');
      setOrganizations(response.data.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleJoinOrganization = async (organizationId) => {
    try {
      setJoiningOrganization(true);
      await api.post('/users/organizations/join', { organizationId });
      alert('Successfully joined organization! You can now create application forms.');
      await fetchFormConfig(); // Refresh the form config
    } catch (error) {
      console.error('Error joining organization:', error);
      alert('Error joining organization: ' + (error.response?.data?.message || error.message));
    } finally {
      setJoiningOrganization(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/membership/application-form', formConfig);
      alert('Application form saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      if (error.response?.data?.code === 'NO_ORGANIZATION') {
        setShowOrganizationSelector(true);
        await fetchOrganizations();
      } else {
        alert('Error saving form: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      // First save the current form
      await api.post('/membership/application-form', formConfig);
      // Then publish it
      await api.post('/membership/application-form/publish');
      setFormConfig(prev => ({ ...prev, isPublished: true }));
      alert('Application form published successfully!');
    } catch (error) {
      console.error('Error publishing form:', error);
      if (error.response?.data?.code === 'NO_ORGANIZATION') {
        setShowOrganizationSelector(true);
        await fetchOrganizations();
      } else {
        alert('Error publishing form: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setSaving(true);
      await api.post('/membership/application-form/unpublish');
      setFormConfig(prev => ({ ...prev, isPublished: false }));
      alert('Application form unpublished successfully!');
    } catch (error) {
      console.error('Error unpublishing form:', error);
      alert('Error unpublishing form: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="form-builder-container">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (showOrganizationSelector) {
    return (
      <div className="form-builder-container">
        <div className="organization-selector">
          <div className="selector-header">
            <i className="fas fa-building"></i>
            <h2>Join an Organization</h2>
            <p>You need to be a member of an organization to create application forms.</p>
          </div>
          
          <div className="organizations-list">
            {organizations.length === 0 ? (
              <div className="no-organizations">
                <p>No organizations available to join.</p>
              </div>
            ) : (
              organizations.map(org => (
                <div key={org.id} className="organization-card">
                  <div className="org-info">
                    <h3>{org.name}</h3>
                    <p>{org.description}</p>
                    {org.website && (
                      <a href={org.website} target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-external-link-alt"></i> Visit Website
                      </a>
                    )}
                  </div>
                  <button 
                    onClick={() => handleJoinOrganization(org.id)}
                    disabled={joiningOrganization}
                    className="join-button"
                  >
                    {joiningOrganization ? 'Joining...' : 'Join Organization'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <style jsx>{`
          .form-builder-container {
            padding: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
          }

          .organization-selector {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            padding: 40px;
            max-width: 800px;
            width: 100%;
          }

          .selector-header {
            text-align: center;
            margin-bottom: 40px;
          }

          .selector-header i {
            font-size: 3rem;
            color: #3498db;
            margin-bottom: 20px;
          }

          .selector-header h2 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 2rem;
          }

          .selector-header p {
            color: #7f8c8d;
            font-size: 1.1rem;
            margin: 0;
          }

          .organizations-list {
            display: grid;
            gap: 20px;
          }

          .organization-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px;
            border: 1px solid #ecf0f1;
            border-radius: 8px;
            transition: border-color 0.3s ease;
          }

          .organization-card:hover {
            border-color: #3498db;
          }

          .org-info h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 1.3rem;
          }

          .org-info p {
            margin: 0 0 10px 0;
            color: #7f8c8d;
            line-height: 1.5;
          }

          .org-info a {
            color: #3498db;
            text-decoration: none;
            font-size: 0.9rem;
          }

          .org-info a:hover {
            text-decoration: underline;
          }

          .join-button {
            background: #27ae60;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s ease;
          }

          .join-button:hover:not(:disabled) {
            background: #219a52;
          }

          .join-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .no-organizations {
            text-align: center;
            padding: 40px;
            color: #7f8c8d;
          }

          .loading-container {
            text-align: center;
            padding: 60px;
          }

          .loading-container i {
            font-size: 3rem;
            color: #3498db;
            margin-bottom: 20px;
          }

          .loading-container p {
            color: #7f8c8d;
            font-size: 1.1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="form-builder-container">
      <div className="form-builder-header">
        <h2>Application Form Builder</h2>
        <div className="header-actions">
          <button onClick={handleSave} className="save-button" disabled={saving}>
            <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save'}
          </button>
          {formConfig.isPublished ? (
            <button onClick={handleUnpublish} className="unpublish-button" disabled={saving}>
              <i className="fas fa-eye-slash"></i> {saving ? 'Unpublishing...' : 'Unpublish'}
            </button>
          ) : (
            <button onClick={handlePublish} className="publish-button" disabled={saving}>
              <i className="fas fa-globe"></i> {saving ? 'Publishing...' : 'Publish'}
            </button>
          )}
          {formConfig.isPublished && (
            <div className="published-status">
              <i className="fas fa-check-circle"></i> Published
            </div>
          )}
        </div>
      </div>

      <div className="form-builder-content">
        <div className="form-config">
          <div className="config-section">
            <h3>Form Configuration</h3>
            
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formConfig.title}
                onChange={(e) => setFormConfig(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                placeholder="Form title"
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formConfig.description}
                onChange={(e) => setFormConfig(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Form description"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Footer</label>
              <textarea
                value={formConfig.footer}
                onChange={(e) => setFormConfig(prev => ({
                  ...prev,
                  footer: e.target.value
                }))}
                placeholder="Footer text"
                rows="2"
              />
            </div>
            
            <div className="form-group">
              <label>Terms & Conditions</label>
              <textarea
                value={formConfig.terms}
                onChange={(e) => setFormConfig(prev => ({
                  ...prev,
                  terms: e.target.value
                }))}
                placeholder="Terms and conditions"
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label>Agreement Text</label>
              <textarea
                value={formConfig.agreement}
                onChange={(e) => setFormConfig(prev => ({
                  ...prev,
                  agreement: e.target.value
                }))}
                placeholder="Agreement text"
                rows="2"
              />
            </div>
          </div>

          <div className="config-section">
            <h3>Dynamic Fields</h3>
            <div className="no-fields">
              <i className="fas fa-edit"></i>
              <p>No custom fields added yet</p>
              <button className="add-field-button">
                <i className="fas fa-plus"></i> Add Field
              </button>
            </div>
          </div>
        </div>

        <div className="form-preview">
          <h3>Preview</h3>
          <div className="preview-container">
            <div className="preview-form">
              <h2>{formConfig.title}</h2>
              {formConfig.description && (
                <p className="form-description">{formConfig.description}</p>
              )}
              
              <div className="preview-fields">
                <div className="preview-field">
                  <label>Email *</label>
                  <input type="email" disabled placeholder="email@example.com" />
                </div>
                <div className="preview-field">
                  <label>First Name *</label>
                  <input type="text" disabled placeholder="John" />
                </div>
                <div className="preview-field">
                  <label>Last Name</label>
                  <input type="text" disabled placeholder="Doe" />
                </div>
                <div className="preview-field">
                  <label>Phone</label>
                  <input type="tel" disabled placeholder="+1 (555) 123-4567" />
                </div>
              </div>
              
              {formConfig.terms && (
                <div className="preview-terms">
                  <h4>Terms & Conditions</h4>
                  <p>{formConfig.terms}</p>
                </div>
              )}
              
              {formConfig.agreement && (
                <div className="preview-agreement">
                  <label>
                    <input type="checkbox" disabled />
                    {formConfig.agreement}
                  </label>
                </div>
              )}
              
              {formConfig.footer && (
                <div className="preview-footer">
                  <p>{formConfig.footer}</p>
                </div>
              )}
              
              <button className="preview-submit" disabled>
                Submit Application
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-builder-container {
          padding: 30px;
        }

        .form-builder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .form-builder-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .header-actions {
          display: flex;
          gap: 15px;
        }

        .save-button,
        .publish-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s ease;
        }

        .save-button {
          background: #3498db;
          color: white;
        }

        .save-button:hover {
          background: #2980b9;
        }

        .publish-button {
          background: #27ae60;
          color: white;
        }

        .publish-button:hover {
          background: #219a52;
        }

        .form-builder-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .form-config {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 30px;
        }

        .config-section {
          margin-bottom: 40px;
        }

        .config-section:last-child {
          margin-bottom: 0;
        }

        .config-section h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.2rem;
          border-bottom: 1px solid #ecf0f1;
          padding-bottom: 10px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2c3e50;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
        }

        .no-fields {
          text-align: center;
          padding: 40px;
          color: #7f8c8d;
        }

        .no-fields i {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .add-field-button {
          background: #f39c12;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 15px;
        }

        .form-preview {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 30px;
        }

        .form-preview h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.2rem;
          border-bottom: 1px solid #ecf0f1;
          padding-bottom: 10px;
        }

        .preview-container {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          border: 2px dashed #ddd;
        }

        .preview-form {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .preview-form h2 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          text-align: center;
        }

        .form-description {
          text-align: center;
          color: #7f8c8d;
          margin-bottom: 30px;
        }

        .preview-fields {
          margin-bottom: 30px;
        }

        .preview-field {
          margin-bottom: 20px;
        }

        .preview-field label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2c3e50;
        }

        .preview-field input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: #f8f9fa;
        }

        .preview-terms {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .preview-terms h4 {
          margin: 0 0 10px 0;
          color: #2c3e50;
        }

        .preview-agreement {
          margin-bottom: 20px;
        }

        .preview-agreement label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .preview-footer {
          margin-bottom: 20px;
          text-align: center;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .preview-submit {
          width: 100%;
          background: #3498db;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 1rem;
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .form-builder-container {
            padding: 20px;
          }

          .form-builder-header {
            flex-direction: column;
            gap: 20px;
            align-items: stretch;
          }

          .form-builder-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ApplicationFormBuilder;
