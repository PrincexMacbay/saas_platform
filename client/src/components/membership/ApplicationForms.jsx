import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmDialog from '../ConfirmDialog';

const ApplicationForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [viewingForm, setViewingForm] = useState(null);
  const [showOrganizationSelector, setShowOrganizationSelector] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [joiningOrganization, setJoiningOrganization] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/membership/application-forms');
      setForms(response.data.data || []);
      setShowOrganizationSelector(false);
    } catch (error) {
      console.error('Error fetching forms:', error);
      if (error.response?.data?.code === 'NO_ORGANIZATION') {
        setShowOrganizationSelector(true);
        await fetchOrganizations();
      } else {
        setError(error.response?.data?.message || 'Failed to fetch application forms');
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
      await fetchForms();
    } catch (error) {
      console.error('Error joining organization:', error);
      alert('Failed to join organization: ' + (error.response?.data?.message || error.message));
    } finally {
      setJoiningOrganization(false);
    }
  };

  const handleAddForm = () => {
    setEditingForm(null);
    setShowModal(true);
  };

  const handleViewForm = (form) => {
    setViewingForm(form);
  };

  const handleEditForm = (form) => {
    // Navigate to application form builder with the form ID (secure approach)
    window.location.href = `/membership/application-form?formId=${form.id}`;
  };

  const handleDeleteForm = async (formId) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this form? This cannot be undone.',
      onConfirm: () => deleteForm(formId)
    });
  };

  const deleteForm = async (formId) => {
    try {
      await api.delete(`/membership/application-forms/${formId}`);
      fetchForms();
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('formUpdated'));
    } catch (error) {
      alert('Error deleting form: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePublishForm = async (formId) => {
    try {
      await api.patch(`/membership/application-forms/${formId}/publish`);
      fetchForms();
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('formUpdated'));
    } catch (error) {
      alert('Error publishing form: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUnpublishForm = async (formId) => {
    try {
      await api.patch(`/membership/application-forms/${formId}/unpublish`);
      fetchForms();
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('formUpdated'));
    } catch (error) {
      alert('Error unpublishing form: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (isPublished) => {
    if (isPublished) {
      return <span className="status-badge published">Published</span>;
    } else {
      return <span className="status-badge draft">Draft</span>;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && forms.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading application forms...</p>
      </div>
    );
  }

  if (showOrganizationSelector) {
    return (
      <div className="organization-selector">
        <div className="selector-content">
          <h2>Join an Organization</h2>
          <p>You need to join an organization to create and manage application forms.</p>
          
          {organizations.length > 0 ? (
            <div className="organizations-list">
              {organizations.map(org => (
                <div key={org.id} className="organization-item">
                  <div className="org-info">
                    <h3>{org.name}</h3>
                    <p>{org.description || 'No description available'}</p>
                  </div>
                  <button
                    onClick={() => handleJoinOrganization(org.id)}
                    disabled={joiningOrganization}
                    className="join-button"
                  >
                    {joiningOrganization ? 'Joining...' : 'Join Organization'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-organizations">
              <p>No organizations available to join.</p>
            </div>
          )}
        </div>

        <style jsx>{`
          .organization-selector {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
            padding: 20px;
          }

          .selector-content {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
            text-align: center;
          }

          .selector-content h2 {
            color: #2c3e50;
            margin-bottom: 10px;
          }

          .selector-content p {
            color: #7f8c8d;
            margin-bottom: 30px;
          }

          .organizations-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .organization-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border: 1px solid #ecf0f1;
            border-radius: 8px;
            background: #f8f9fa;
          }

          .org-info h3 {
            margin: 0 0 5px 0;
            color: #2c3e50;
          }

          .org-info p {
            margin: 0;
            color: #7f8c8d;
            font-size: 0.9rem;
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
        `}</style>
      </div>
    );
  }

  return (
    <div className="forms-container">
      <div className="forms-header">
        <h2>Application Forms</h2>
        <button onClick={handleAddForm} className="add-button">
          <i className="fas fa-plus"></i> Create Form
        </button>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="forms-grid">
        {forms.map(form => (
          <div key={form.id} className="form-card">
            <div className="form-header">
              <div className="form-title">
                <h3>{form.title}</h3>
                {getStatusBadge(form.isPublished)}
              </div>
              <div className="form-actions">
                <button
                  onClick={() => handleViewForm(form)}
                  className="view-button"
                  title="View Form"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  onClick={() => handleEditForm(form)}
                  className="edit-button"
                  title="Edit Form"
                >
                  <i className="fas fa-edit"></i>
                </button>
                {form.isPublished ? (
                  <button
                    onClick={() => handleUnpublishForm(form.id)}
                    className="unpublish-button"
                    title="Unpublish Form"
                  >
                    <i className="fas fa-eye-slash"></i>
                  </button>
                ) : (
                  <button
                    onClick={() => handlePublishForm(form.id)}
                    className="publish-button"
                    title="Publish Form"
                  >
                    <i className="fas fa-globe"></i>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteForm(form.id)}
                  className="delete-button"
                  title="Delete Form"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div className="form-content">
              {form.description && (
                <p className="form-description">{form.description}</p>
              )}

              <div className="form-stats">
                <div className="stat">
                  <i className="fas fa-list"></i>
                  <span>{form.fields ? form.fields.length : 0} Fields</span>
                </div>
                <div className="stat">
                  <i className="fas fa-calendar"></i>
                  <span>Created {formatDate(form.createdAt)}</span>
                </div>
                {form.updatedAt !== form.createdAt && (
                  <div className="stat">
                    <i className="fas fa-edit"></i>
                    <span>Updated {formatDate(form.updatedAt)}</span>
                  </div>
                )}
              </div>

              {form.fields && form.fields.length > 0 && (
                <div className="form-fields-preview">
                  <h4>Form Fields:</h4>
                  <div className="fields-list">
                    {form.fields.slice(0, 3).map((field, index) => (
                      <span key={index} className="field-tag">
                        {field.label || field.name}
                      </span>
                    ))}
                    {form.fields.length > 3 && (
                      <span className="field-tag more">
                        +{form.fields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {forms.length === 0 && !loading && (
        <div className="no-data">
          <i className="fas fa-file-alt"></i>
          <p>No application forms found</p>
          <button onClick={handleAddForm} className="add-first-button">
            Create your first form
          </button>
        </div>
      )}

      {showModal && (
        <ApplicationFormModal
          form={editingForm}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchForms();
          }}
        />
      )}



      {/* View Form Modal */}
      {viewingForm && (
        <div className="modal-overlay" onClick={() => setViewingForm(null)}>
          <div className="modal-content view-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>View Application Form: {viewingForm.title}</h3>
              <button onClick={() => setViewingForm(null)} className="close-button">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {viewingForm.description && (
                <div className="form-description-section">
                  <h4>Description</h4>
                  <p>{viewingForm.description}</p>
                </div>
              )}

              <div className="form-status-section">
                <h4>Status</h4>
                {getStatusBadge(viewingForm.isPublished)}
              </div>

              <div className="form-fields-section">
                <h4>Form Fields ({viewingForm.fields ? viewingForm.fields.length : 0})</h4>
                {viewingForm.fields && viewingForm.fields.length > 0 ? (
                  <div className="fields-list">
                    {viewingForm.fields.map((field, index) => (
                      <div key={index} className="field-item">
                        <div className="field-header">
                          <span className="field-label">{field.label || field.name}</span>
                          <span className={`field-type ${field.type}`}>{field.type}</span>
                          {field.required && <span className="required-badge">Required</span>}
                        </div>
                        {field.placeholder && (
                          <div className="field-placeholder">
                            <small>Placeholder: {field.placeholder}</small>
                          </div>
                        )}
                        {field.options && field.options.length > 0 && (
                          <div className="field-options">
                            <small>Options: {field.options.join(', ')}</small>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-fields">No fields defined for this form.</p>
                )}
              </div>

              <div className="form-meta-section">
                <h4>Form Information</h4>
                <div className="meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Created:</span>
                    <span className="meta-value">{formatDate(viewingForm.createdAt)}</span>
                  </div>
                  {viewingForm.updatedAt !== viewingForm.createdAt && (
                    <div className="meta-item">
                      <span className="meta-label">Last Updated:</span>
                      <span className="meta-value">{formatDate(viewingForm.updatedAt)}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-label">Organization:</span>
                    <span className="meta-value">{viewingForm.formOrganization?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => handleEditForm(viewingForm)} 
                className="edit-form-button"
              >
                <i className="fas fa-edit"></i> Edit Form
              </button>
              <button onClick={() => setViewingForm(null)} className="close-modal-button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .forms-container {
          padding: 30px;
        }

        .forms-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .forms-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .add-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s ease;
        }

        .add-button:hover {
          background: #2980b9;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .forms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }

        .form-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .form-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 25px 25px 15px 25px;
          border-bottom: 1px solid #ecf0f1;
        }

        .form-title h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 1.3rem;
        }

        .form-actions {
          display: flex;
          gap: 8px;
        }

        .view-button,
        .edit-button,
        .publish-button,
        .unpublish-button,
        .delete-button {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-button {
          background: #f8f9fa;
          color: #3498db;
        }

        .view-button:hover {
          background: #3498db;
          color: white;
        }

        .edit-button {
          background: #f8f9fa;
          color: #f39c12;
        }

        .edit-button:hover {
          background: #f39c12;
          color: white;
        }

        .publish-button {
          background: #f8f9fa;
          color: #27ae60;
        }

        .publish-button:hover {
          background: #27ae60;
          color: white;
        }

        .unpublish-button {
          background: #f8f9fa;
          color: #f39c12;
        }

        .unpublish-button:hover {
          background: #f39c12;
          color: white;
        }

        .delete-button {
          background: #f8f9fa;
          color: #e74c3c;
        }

        .delete-button:hover {
          background: #e74c3c;
          color: white;
        }

        .form-content {
          padding: 25px;
        }

        .form-description {
          color: #7f8c8d;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .form-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .stat i {
          color: #3498db;
        }

        .form-fields-preview h4 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          font-size: 1rem;
        }

        .fields-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .field-tag {
          background: #ecf0f1;
          color: #34495e;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .field-tag.more {
          background: #3498db;
          color: white;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-badge.published {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.draft {
          background: #fff3cd;
          color: #856404;
        }

        .no-data {
          text-align: center;
          padding: 60px;
          color: #7f8c8d;
        }

        .no-data i {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .add-first-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 20px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .forms-container {
            padding: 20px;
          }

          .forms-header {
            flex-direction: column;
            gap: 20px;
            align-items: stretch;
          }

          .forms-grid {
            grid-template-columns: 1fr;
          }

          .form-header {
            flex-direction: column;
            gap: 15px;
          }

          .form-stats {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

// Application Form Modal Component
const ApplicationFormModal = ({ form, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: form?.title || '',
    description: form?.description || '',
    fields: form?.fields || []
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (form) {
        await api.put(`/membership/application-forms/${form.id}`, formData);
      } else {
        await api.post('/membership/application-forms', formData);
      }
      
      onSave();
    } catch (error) {
      alert('Error saving form: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{form ? 'Edit Form' : 'Create Form'}</h3>
          <button onClick={onClose} className="close-button">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Form Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Gym Membership Application"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Form description..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-button">
              {loading ? 'Saving...' : 'Save Form'}
            </button>
          </div>
        </form>

        <style jsx>{`
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

          .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            border-bottom: 1px solid #ecf0f1;
          }

          .modal-header h3 {
            margin: 0;
            color: #2c3e50;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #7f8c8d;
            cursor: pointer;
          }

          .modal-form {
            padding: 30px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
          }

          .form-group label {
            margin-bottom: 8px;
            font-weight: 500;
            color: #2c3e50;
          }

          .form-group input,
          .form-group textarea {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
          }

          .cancel-button,
          .save-button {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
          }

          .cancel-button {
            background: #f8f9fa;
            color: #6c757d;
          }

          .save-button {
            background: #3498db;
            color: white;
          }

          .save-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* View Modal Styles */
          .view-modal {
            max-width: 800px !important;
          }

          .modal-body {
            padding: 30px;
            max-height: 60vh;
            overflow-y: auto;
          }

          .form-description-section,
          .form-status-section,
          .form-fields-section,
          .form-meta-section {
            margin-bottom: 30px;
          }

          .form-description-section h4,
          .form-status-section h4,
          .form-fields-section h4,
          .form-meta-section h4 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 1.1rem;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 8px;
          }

          .form-description-section p {
            color: #7f8c8d;
            line-height: 1.6;
            margin: 0;
          }

          .fields-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }

          .field-item {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
          }

          .field-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
          }

          .field-label {
            font-weight: 500;
            color: #2c3e50;
            flex: 1;
          }

          .field-type {
            background: #3498db;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            text-transform: uppercase;
          }

          .required-badge {
            background: #e74c3c;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.7rem;
          }

          .field-placeholder,
          .field-options {
            margin-top: 5px;
          }

          .field-placeholder small,
          .field-options small {
            color: #7f8c8d;
            font-style: italic;
          }

          .no-fields {
            color: #7f8c8d;
            font-style: italic;
            text-align: center;
            padding: 20px;
          }

          .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }

          .meta-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          .meta-label {
            font-weight: 500;
            color: #2c3e50;
            font-size: 0.9rem;
          }

          .meta-value {
            color: #7f8c8d;
            font-size: 0.9rem;
          }

          .edit-form-button {
            background: #f39c12;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s ease;
          }

          .edit-form-button:hover {
            background: #e67e22;
          }

          .close-modal-button {
            background: #6c757d;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s ease;
          }

          .close-modal-button:hover {
            background: #5a6268;
          }

          @media (max-width: 768px) {
            .view-modal {
              width: 95% !important;
              max-width: none !important;
            }

            .meta-grid {
              grid-template-columns: 1fr;
            }

            .field-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 5px;
            }
          }
        `}</style>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ApplicationForms;
