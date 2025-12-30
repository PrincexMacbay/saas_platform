import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useMembershipData } from '../../contexts/MembershipDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotificationModal } from '../../contexts/NotificationModalContext';
import { getPlans } from '../../services/membershipService';

const ApplicationFormBuilder = () => {
  const { data, loading: contextLoading, refreshData, isLoadingAll } = useMembershipData();
  const { t } = useLanguage();
  const { showSuccess, showError, showWarning } = useNotificationModal();
  const [formConfig, setFormConfig] = useState({
    title: 'Membership Application',
    description: '',
    footer: '',
    terms: '',
    agreement: '',
    fields: data.applicationForms?.[0]?.fields || [],
    isPublished: data.applicationForms?.[0]?.isPublished || false,
    planId: data.applicationForms?.[0]?.planId || null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOrganizationSelector, setShowOrganizationSelector] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [joiningOrganization, setJoiningOrganization] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  // Track the original planId to detect changes
  const [originalPlanId, setOriginalPlanId] = useState(null);
  
  // Add Field Modal State
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    description: '',
    dataType: 'text',
    inputType: 'text',
    required: false,
    placeholder: '',
    options: []
  });

  // Fetch organizations - defined first since it's used by fetchFormConfig
  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/users/organizations/available');
      setOrganizations(response.data.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  // Load plans function - defined before useEffect to avoid initialization error
  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      // Use plans from context if available
      if (data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
        setAvailablePlans(data.plans);
      } else {
        // Fetch plans if not in context
        const response = await getPlans();
        const plans = response.data?.data?.plans || [];
        setAvailablePlans(plans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Fetch form config - defined before useEffect
  const fetchFormConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/membership/application-forms');
      // Get the first form for the organization, or create a new one
      const forms = response.data.data || [];
      if (forms.length > 0) {
        const form = forms[0];
        // Filter out any email fields that might have been added manually
        const filteredFields = (form.fields || []).filter(field => 
          field.name?.toLowerCase() !== 'email' && 
          field.inputType !== 'email' && 
          field.dataType !== 'email'
        );
        setFormConfig({
          ...form,
          fields: filteredFields,
          planId: form.planId || null
        });
        if (form.planId) {
          setSelectedPlanId(form.planId.toString());
        } else {
          setSelectedPlanId('');
        }
        // Store original planId to detect changes
        setOriginalPlanId(form.planId || null);
      } else {
        // Create a new form config
        setFormConfig({
          title: 'Membership Application',
          description: 'Please fill out this form to apply for membership.',
          fields: [],
          planId: null
        });
        setSelectedPlanId('');
        setOriginalPlanId(null);
      }
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

  // Fetch form by ID - defined before useEffect
  const fetchFormById = async (formId) => {
    try {
      setLoading(true);
      const response = await api.get(`/membership/application-forms/${formId}`);
      const form = response.data.data;
      
      if (form) {
        setFormConfig({
          id: form.id,
          title: form.title || 'Membership Application',
          description: form.description || '',
          footer: form.footer || '',
          terms: form.terms || '',
          agreement: form.agreement || '',
          fields: form.fields || [],
          isPublished: form.isPublished || false,
          planId: form.planId || null
        });
        if (form.planId) {
          setSelectedPlanId(form.planId.toString());
        } else {
          setSelectedPlanId('');
        }
        // Store original planId to detect changes
        setOriginalPlanId(form.planId || null);
      } else {
        // Form not found or user doesn't have access
        alert(t('form.builder.form.not.found'));
        fetchFormConfig();
      }
    } catch (error) {
      console.error('Error fetching form by ID:', error);
      if (error.response?.status === 404 || error.response?.status === 403) {
        alert(t('form.builder.form.not.found'));
      }
      fetchFormConfig();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load plans for selection
    loadPlans();
    
    // Check if we're editing an existing form by ID (secure approach)
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('formId');
    
    if (formId) {
      // Fetch the form by ID from the server (this will verify user access)
      fetchFormById(formId);
    } else {
      fetchFormConfig();
    }
  }, []);

  const handleJoinOrganization = async (organizationId) => {
    try {
      setJoiningOrganization(true);
      await api.post('/users/organizations/join', { organizationId });
      showSuccess(t('form.builder.successfully.joined'), t('form.builder.success.title') || 'Success');
      await fetchFormConfig(); // Refresh the form config
    } catch (error) {
      console.error('Error joining organization:', error);
      showError(t('form.builder.error.joining', { error: error.response?.data?.message || error.message }), t('form.builder.error.title') || 'Error');
    } finally {
      setJoiningOrganization(false);
    }
  };

  const handleNewForm = () => {
    const confirmed = window.confirm(
      'This will start a new form. Any unsaved changes to the current form will be lost.\n\n' +
      'Do you want to continue?'
    );
    if (confirmed) {
      setFormConfig({
        title: 'Membership Application',
        description: '',
        footer: '',
        terms: '',
        agreement: '',
        fields: [],
        isPublished: false,
        planId: null
      });
      setSelectedPlanId('');
      setOriginalPlanId(null);
      showSuccess('Started a new form. Build your form and save when ready.', 'New Form');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const newPlanId = selectedPlanId ? parseInt(selectedPlanId) : null;
      const saveData = {
        ...formConfig,
        planId: newPlanId
      };
      
      // Check if planId has changed from the original
      const planIdChanged = originalPlanId !== newPlanId;
      
      if (formConfig.id && !planIdChanged) {
        // Update existing form (planId hasn't changed)
        await api.put(`/membership/application-forms/${formConfig.id}`, saveData);
        setFormConfig(prev => ({ ...prev, planId: saveData.planId }));
        showSuccess(t('form.builder.form.updated'), t('form.builder.success.title') || 'Success');
      } else if (formConfig.id && planIdChanged) {
        // PlanId changed - create a NEW form to preserve the original
        const newFormData = {
          ...saveData,
          id: undefined, // Remove ID to create new form
          isPublished: false // New form starts as unpublished
        };
        const response = await api.post('/membership/application-forms', newFormData);
        setFormConfig(prev => ({ 
          ...prev, 
          id: response.data.data.id, 
          planId: saveData.planId,
          isPublished: false
        }));
        setOriginalPlanId(newPlanId);
        showSuccess(
          'New form created! The original form has been preserved. Please publish this new form if you want to use it.',
          t('form.builder.success.title') || 'Success'
        );
      } else {
        // Create new form (no existing ID)
        const response = await api.post('/membership/application-forms', saveData);
        setFormConfig(prev => ({ ...prev, id: response.data.data.id, planId: saveData.planId }));
        setOriginalPlanId(newPlanId);
        showSuccess(t('form.builder.form.saved'), t('form.builder.success.title') || 'Success');
      }
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('formUpdated'));
    } catch (error) {
      console.error('Error saving form:', error);
      if (error.response?.data?.code === 'NO_ORGANIZATION') {
        setShowOrganizationSelector(true);
        await fetchOrganizations();
      } else {
        showError(t('form.builder.error.saving', { error: error.response?.data?.message || error.message }), t('form.builder.error.title') || 'Error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      let formId = formConfig.id;
      
      // First save the current form if it doesn't have an ID
      if (!formId) {
        const response = await api.post('/membership/application-forms', formConfig);
        formId = response.data.data.id;
        setFormConfig(prev => ({ ...prev, id: formId }));
      }
      
      // Then publish it using the correct ID
      await api.patch(`/membership/application-forms/${formId}/publish`);
      setFormConfig(prev => ({ ...prev, isPublished: true }));
      showSuccess(t('form.builder.form.published'), t('form.builder.success.title') || 'Success');
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('formUpdated'));
    } catch (error) {
      console.error('Error publishing form:', error);
      if (error.response?.data?.code === 'NO_ORGANIZATION') {
        setShowOrganizationSelector(true);
        await fetchOrganizations();
      } else {
        showError(t('form.builder.error.publishing', { error: error.response?.data?.message || error.message }), t('form.builder.error.title') || 'Error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setSaving(true);
      if (!formConfig.id) {
        showWarning(t('form.builder.cannot.unpublish'), t('form.builder.warning.title') || 'Warning');
        return;
      }
      await api.patch(`/membership/application-forms/${formConfig.id}/unpublish`);
      setFormConfig(prev => ({ ...prev, isPublished: false }));
      showSuccess(t('form.builder.form.unpublished'), t('form.builder.success.title') || 'Success');
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('formUpdated'));
    } catch (error) {
      console.error('Error unpublishing form:', error);
      showError(t('form.builder.error.unpublishing', { error: error.response?.data?.message || error.message }), t('form.builder.error.title') || 'Error');
    } finally {
      setSaving(false);
    }
  };

  // Add Field Modal Functions
  const handleAddField = () => {
    setShowAddFieldModal(true);
    setNewField({
      name: '',
      label: '',
      description: '',
      dataType: 'text',
      inputType: 'text',
      required: false,
      placeholder: '',
      options: []
    });
  };

  const handleFieldInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewField(prev => {
      let newValue;
      if (type === 'checkbox') {
        newValue = checked;
      } else if (type === 'radio') {
        // Convert string to boolean for 'required' field
        if (name === 'required') {
          newValue = value === 'true' || value === true;
        } else {
          newValue = value === 'true' ? true : value === 'false' ? false : value;
        }
      } else {
        newValue = value;
      }
      return {
        ...prev,
        [name]: newValue
      };
    });
  };

  const handleSaveField = () => {
    if (!newField.name || !newField.label) {
      showWarning(t('form.builder.field.name.required'), t('form.builder.warning.title') || 'Warning');
      return;
    }

    // Generate field name from label if not provided
    const fieldName = newField.name || newField.label.toLowerCase().replace(/\s+/g, '_');
    
    // Prevent creating email field - email is automatically included from user registration
    if (fieldName.toLowerCase() === 'email' || newField.inputType === 'email' || newField.dataType === 'email') {
      showWarning('Email field cannot be added. User email from registration will be automatically included in the application form.', t('form.builder.warning.title') || 'Warning');
      return;
    }
    
    const fieldToAdd = {
      ...newField,
      name: fieldName,
      id: Date.now() // Temporary ID for frontend
    };

    setFormConfig(prev => ({
      ...prev,
      fields: [...prev.fields, fieldToAdd]
    }));

    setShowAddFieldModal(false);
  };

  const handleDeleteField = (fieldId) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  // Only show loading if no data is available at all and not in global preload
  if (loading && !data.applicationForms && !isLoadingAll) {
    return (
      <div className="form-builder-container">
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>{t('form.builder.loading')}</p>
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
            <h2>{t('form.builder.join.organization')}</h2>
            <p>{t('form.builder.join.description')}</p>
          </div>
          
          <div className="organizations-list">
            {organizations.length === 0 ? (
              <div className="no-organizations">
                <p>{t('form.builder.no.organizations')}</p>
              </div>
            ) : (
              organizations.map(org => (
                <div key={org.id} className="organization-card">
                  <div className="org-info">
                    <h3>{org.name}</h3>
                    <p>{org.description}</p>
                    {org.website && (
                      <a href={org.website} target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-external-link-alt"></i> {t('form.builder.visit.website')}
                      </a>
                    )}
                  </div>
                  <button 
                    onClick={() => handleJoinOrganization(org.id)}
                    disabled={joiningOrganization}
                    className="join-button"
                  >
                    {joiningOrganization ? t('form.builder.joining') : t('form.builder.join.organization.button')}
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
        <h2>{formConfig.id ? t('form.builder.edit.title') : t('form.builder.title')}</h2>
        <div className="header-actions">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {formConfig.id && (
              <button onClick={handleNewForm} className="new-form-button" style={{
                padding: '12px 24px',
                border: '1px solid #6c757d',
                borderRadius: '6px',
                background: '#f8f9fa',
                color: '#6c757d',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}>
                <i className="fas fa-plus"></i> New Form
              </button>
            )}
            <button onClick={handleSave} className="save-button" disabled={saving}>
              <i className="fas fa-save"></i> {saving ? t('form.builder.saving') : t('form.builder.save')}
            </button>
          </div>
          {formConfig.isPublished ? (
            <button onClick={handleUnpublish} className="unpublish-button" disabled={saving}>
              <i className="fas fa-eye-slash"></i> {saving ? t('form.builder.unpublishing') : t('form.builder.unpublish')}
            </button>
          ) : (
            <button onClick={handlePublish} className="publish-button" disabled={saving}>
              <i className="fas fa-globe"></i> {saving ? t('form.builder.publishing') : t('form.builder.publish')}
            </button>
          )}
          {formConfig.isPublished && (
            <div className="published-status">
              <i className="fas fa-check-circle"></i> {t('form.builder.published')}
            </div>
          )}
        </div>
      </div>

      <div className="form-builder-content">
        <div className="form-config">
          <div className="config-section">
            <h3>{t('form.builder.form.configuration')}</h3>
            
            <div className="form-group">
              <label>
                Associate with Membership Plan 
                <span style={{ color: '#999', fontWeight: 'normal', marginLeft: '5px' }}>(Optional)</span>
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => {
                  const newPlanId = e.target.value;
                  // If changing planId on an existing form, show warning
                  if (formConfig.id && originalPlanId !== (newPlanId ? parseInt(newPlanId) : null)) {
                    const confirmed = window.confirm(
                      'Changing the plan association will create a NEW form. The current form will be preserved.\n\n' +
                      'Do you want to continue?'
                    );
                    if (!confirmed) {
                      return; // Don't change the selection
                    }
                  }
                  setSelectedPlanId(newPlanId);
                }}
                className="form-control"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">📋 General Form (applies to all plans)</option>
                {loadingPlans ? (
                  <option disabled>Loading plans...</option>
                ) : availablePlans.length === 0 ? (
                  <option disabled>No plans available. Create a plan first to create plan-specific forms.</option>
                ) : (
                  availablePlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      🎯 {plan.name} - ${plan.fee || 'Free'} (Plan-specific)
                    </option>
                  ))
                )}
              </select>
              {formConfig.id && originalPlanId !== (selectedPlanId ? parseInt(selectedPlanId) : null) && (
                <div style={{ 
                  background: '#fff3cd', 
                  border: '1px solid #ffc107', 
                  borderRadius: '6px', 
                  padding: '10px', 
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#856404'
                }}>
                  <strong>⚠️ Note:</strong> Changing the plan will create a <strong>new form</strong>. Your current form will be preserved.
                </div>
              )}
              <div style={{ 
                background: '#e8f4f8', 
                border: '1px solid #bee5eb', 
                borderRadius: '6px', 
                padding: '12px', 
                marginTop: '8px',
                fontSize: '12px',
                color: '#0c5460'
              }}>
                <strong>💡 How it works:</strong>
                <ul style={{ margin: '8px 0 0 20px', padding: 0, lineHeight: '1.6' }}>
                  <li><strong>General Form (no plan selected):</strong> Can be created immediately and used by any plan. This is recommended for your first form.</li>
                  <li><strong>Plan-Specific Form:</strong> Can only be created after the plan exists. Select a plan to create a form that applies only to that specific plan.</li>
                  <li><strong>Changing Plans:</strong> If you change the plan on an existing form, a NEW form will be created. Your original form will be preserved.</li>
                  <li><strong>When creating a plan:</strong> You can select either the default form or any published form (general or plan-specific).</li>
                </ul>
              </div>
            </div>
            
            <div className="form-group">
              <label>{t('form.builder.title.label')}</label>
              <input
                type="text"
                value={formConfig.title}
                onChange={(e) => setFormConfig(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                placeholder={t('form.builder.title.placeholder')}
              />
            </div>
            
            <div className="form-group">
              <label>{t('form.builder.description.label')}</label>
              <textarea
                value={formConfig.description}
                onChange={(e) => setFormConfig(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder={t('form.builder.description.placeholder')}
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>{t('form.builder.footer.label')}</label>
              <textarea
                value={formConfig.footer}
                onChange={(e) => setFormConfig(prev => ({
                  ...prev,
                  footer: e.target.value
                }))}
                placeholder={t('form.builder.footer.placeholder')}
                rows="2"
              />
            </div>
            
            <div className="form-group">
              <label>{t('form.builder.terms.label')}</label>
              <textarea
                value={formConfig.terms}
                onChange={(e) => setFormConfig(prev => ({
                  ...prev,
                  terms: e.target.value
                }))}
                placeholder={t('form.builder.terms.placeholder')}
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label>{t('form.builder.agreement.label')}</label>
              <textarea
                value={formConfig.agreement}
                onChange={(e) => setFormConfig(prev => ({
                  ...prev,
                  agreement: e.target.value
                }))}
                placeholder={t('form.builder.agreement.placeholder')}
                rows="2"
              />
            </div>
          </div>

          <div className="config-section">
            <h3>{t('form.builder.dynamic.fields')}</h3>
            {formConfig.fields.length === 0 ? (
              <div className="no-fields">
                <i className="fas fa-edit"></i>
                <p>{t('form.builder.no.fields')}</p>
                <button className="add-field-button" onClick={handleAddField}>
                  <i className="fas fa-plus"></i> {t('form.builder.add.field')}
                </button>
              </div>
            ) : (
              <div className="fields-list">
                {formConfig.fields.map((field, index) => (
                  <div key={field.id} className="field-item">
                    <div className="field-info">
                      <h4>{field.label}</h4>
                      <p className="field-type">{field.inputType} {field.required && <span className="required-badge">Required</span>}</p>
                      {field.description && <p className="field-description">{field.description}</p>}
                    </div>
                    <button 
                      className="delete-field-button"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
                <button className="add-field-button" onClick={handleAddField}>
                  <i className="fas fa-plus"></i> {t('form.builder.add.another.field')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-preview">
          <h3>{t('form.builder.preview')}</h3>
          <div className="preview-container">
            <div className="preview-form">
              <h2>{formConfig.title}</h2>
              {formConfig.description && (
                <p className="form-description">{formConfig.description}</p>
              )}
              
              <div className="preview-fields">
                <div className="preview-field">
                  <label>{t('form.builder.email.label')} *</label>
                  <input type="email" disabled placeholder="email@example.com" />
                </div>
                <div className="preview-field">
                  <label>{t('form.builder.first.name.label')} *</label>
                  <input type="text" disabled placeholder="John" />
                </div>
                <div className="preview-field">
                  <label>{t('form.builder.last.name.label')}</label>
                  <input type="text" disabled placeholder="Doe" />
                </div>
                <div className="preview-field">
                  <label>{t('form.builder.phone.label')}</label>
                  <input type="tel" disabled placeholder="+1 (555) 123-4567" />
                </div>
                
                {/* Custom Fields */}
                {formConfig.fields.map((field) => (
                  <div key={field.id} className="preview-field">
                    <label>
                      {field.label}
                      {field.required && <span className="required"> *</span>}
                    </label>
                    {field.inputType === 'textarea' ? (
                      <textarea 
                        disabled 
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        rows={4}
                      />
                    ) : field.inputType === 'select' ? (
                      <select disabled>
                        <option value="">Select {field.label}</option>
                        {field.options.map((option, index) => (
                          <option key={index} value={option.value || option}>
                            {option.label || option}
                          </option>
                        ))}
                      </select>
                    ) : field.inputType === 'checkbox' ? (
                      <label className="checkbox-label">
                        <input type="checkbox" disabled />
                        {field.label}
                      </label>
                    ) : (
                      <input 
                        type={field.inputType || 'text'} 
                        disabled 
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {formConfig.terms && (
                <div className="preview-terms">
                  <h4>{t('form.builder.terms.conditions')}</h4>
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
                {t('form.builder.submit.application')}
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

        /* Add Field Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          background: #2c3e50;
          color: white;
          padding: 20px;
          border-radius: 12px 12px 0 0;
        }

        .modal-header h3 {
          margin: 0;
          color: white;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: white;
        }

        .modal-form {
          display: grid;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .radio-group {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .radio-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
        }

        .cancel-button {
          background: #95a5a6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
        }

        .add-button {
          background: #27ae60;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
        }

        .fields-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .field-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #ecf0f1;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .field-info h4 {
          margin: 0 0 5px 0;
          color: #2c3e50;
        }

        .field-type {
          margin: 0 0 5px 0;
          font-size: 0.9rem;
          color: #7f8c8d;
        }

        .field-description {
          margin: 0;
          font-size: 0.9rem;
          color: #7f8c8d;
        }

        .delete-field-button {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
        }

        .required {
          color: #e74c3c;
        }

        /* Enhanced Add Field Modal Styles */
        .add-field-modal {
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .form-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #3498db;
        }

        .section-title {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title i {
          color: #3498db;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s ease;
          background: white;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .required-label {
          color: #e74c3c;
          font-weight: 600;
        }

        .required-label::after {
          content: " *";
          color: #e74c3c;
        }

        .form-group small {
          display: block;
          margin-top: 5px;
          color: #7f8c8d;
          font-size: 0.85rem;
          line-height: 1.3;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .checkbox-item:hover {
          background-color: #ecf0f1;
        }

        .form-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #3498db;
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .radio-item {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 12px;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          transition: all 0.2s ease;
          background: white;
        }

        .radio-item:hover {
          border-color: #3498db;
          background-color: #f8f9fa;
        }

        .radio-item input[type="radio"] {
          width: 18px;
          height: 18px;
          accent-color: #3498db;
        }

        .radio-label {
          font-weight: 500;
          color: #2c3e50;
        }

        /* Options Management Styles */
        .options-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .option-item:hover {
          border-color: #3498db;
          box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
        }

        .option-input {
          flex: 1;
          margin: 0;
          border: none;
          background: transparent;
          padding: 8px 12px;
        }

        .option-input:focus {
          box-shadow: none;
          transform: none;
        }

        .remove-option-btn {
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
        }

        .remove-option-btn:hover {
          background: #c0392b;
          transform: scale(1.05);
        }

        .add-option-btn {
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
        }

        .add-option-btn:hover {
          background: #219a52;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
          transform: translateY(-1px);
        }

        .modal-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
        }

        .modal-header h3 i {
          color: #3498db;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 20px;
          color: #7f8c8d;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #ecf0f1;
          color: #e74c3c;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .add-field-modal {
            max-width: 95vw;
            margin: 20px;
          }

          .form-row {
            flex-direction: column;
            gap: 15px;
          }

          .form-section {
            padding: 15px;
          }

          .modal-actions {
            flex-direction: column;
            gap: 10px;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <div className="modal-overlay" onClick={() => setShowAddFieldModal(false)}>
          <div className="modal-content add-field-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-plus-circle"></i> {t('form.builder.add.field')}</h3>
              <button className="close-button" onClick={() => setShowAddFieldModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-form">
              {/* Basic Information Section */}
              <div className="form-section">
                <h4 className="section-title">
                  <i className="fas fa-info-circle"></i> {t('form.builder.basic.information')}
                </h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="required-label">{t('form.builder.field.name')} *</label>
                    <input
                      type="text"
                      name="name"
                      value={newField.name}
                      onChange={handleFieldInputChange}
                      placeholder={t('form.builder.field.name.placeholder')}
                      className="form-input"
                    />
                    <small>{t('form.builder.field.name.help')} Note: "email" cannot be used as a field name (email is automatically included from user registration).</small>
                  </div>
                  <div className="form-group">
                    <label className="required-label">{t('form.builder.field.label')} *</label>
                    <input
                      type="text"
                      name="label"
                      value={newField.label}
                      onChange={handleFieldInputChange}
                      placeholder={t('form.builder.field.label.placeholder')}
                      className="form-input"
                    />
                    <small>{t('form.builder.field.label.help')}</small>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={newField.description}
                    onChange={handleFieldInputChange}
                    placeholder="Brief description of this field"
                    rows="2"
                    className="form-textarea"
                  />
                  <small>Optional help text for users</small>
                </div>

                <div className="form-group">
                  <label>Placeholder Text</label>
                  <input
                    type="text"
                    name="placeholder"
                    value={newField.placeholder}
                    onChange={handleFieldInputChange}
                    placeholder="e.g., Enter your company name"
                    className="form-input"
                  />
                  <small>Hint text shown in the input field</small>
                </div>
              </div>

              {/* Field Configuration Section */}
              <div className="form-section">
                <h4 className="section-title">
                  <i className="fas fa-cog"></i> Field Configuration
                </h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Data Type</label>
                    <select name="dataType" value={newField.dataType} onChange={handleFieldInputChange} className="form-select">
                      <option value="text">Text</option>
                      <option value="phone">Phone</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="url">URL</option>
                    </select>
                    <small>Type of data this field will store</small>
                  </div>
                  <div className="form-group">
                    <label>Input Type</label>
                    <select name="inputType" value={newField.inputType} onChange={handleFieldInputChange} className="form-select">
                      <option value="text">Text Input</option>
                      <option value="textarea">Text Area</option>
                      <option value="select">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="tel">Phone</option>
                      <option value="url">URL</option>
                    </select>
                    <small>How the field will be displayed</small>
                  </div>
                </div>

                {/* Field Requirement Settings */}
                <div className="form-section">
                  <h4 className="section-title">
                    <i className="fas fa-asterisk"></i> Field Requirement
                  </h4>
                  <div className="form-group">
                    <label>Is this field required?</label>
                    <div className="radio-group">
                      <label className="radio-item">
                        <input
                          type="radio"
                          name="required"
                          value="true"
                          checked={newField.required === true}
                          onChange={handleFieldInputChange}
                          className="form-radio"
                        />
                        <span className="radio-mark"></span>
                        <span className="radio-label">
                          <i className="fas fa-check-circle" style={{ color: '#e74c3c', marginRight: '8px' }}></i>
                          Required - Users must fill this field
                        </span>
                      </label>
                      <label className="radio-item">
                        <input
                          type="radio"
                          name="required"
                          value="false"
                          checked={newField.required === false}
                          onChange={handleFieldInputChange}
                          className="form-radio"
                        />
                        <span className="radio-mark"></span>
                        <span className="radio-label">
                          <i className="fas fa-circle" style={{ color: '#95a5a6', marginRight: '8px' }}></i>
                          Optional - Users can skip this field
                        </span>
                      </label>
                    </div>
                    <small style={{ marginTop: '10px', display: 'block', color: '#7f8c8d' }}>
                      {newField.required 
                        ? 'This field will be marked with a red asterisk (*) and users must provide a value before submitting the form.'
                        : 'This field is optional and users can submit the form without filling it.'}
                    </small>
                  </div>
                </div>

                {/* Options Section - Only show for select fields */}
                {newField.inputType === 'select' && (
                  <div className="form-group">
                    <label>Dropdown Options</label>
                    <div className="options-container">
                      {newField.options.map((option, index) => (
                        <div key={index} className="option-item">
                          <input
                            type="text"
                            value={typeof option === 'string' ? option : option.label || option.value}
                            onChange={(e) => {
                              const newOptions = [...newField.options];
                              newOptions[index] = e.target.value;
                              setNewField(prev => ({ ...prev, options: newOptions }));
                            }}
                            placeholder={`Option ${index + 1}`}
                            className="form-input option-input"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = newField.options.filter((_, i) => i !== index);
                              setNewField(prev => ({ ...prev, options: newOptions }));
                            }}
                            className="remove-option-btn"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setNewField(prev => ({ ...prev, options: [...prev.options, ''] }));
                        }}
                        className="add-option-btn"
                      >
                        <i className="fas fa-plus"></i> Add Option
                      </button>
                    </div>
                    <small>Add options for the dropdown menu</small>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddFieldModal(false)}>
                <i className="fas fa-times"></i> {t('form.builder.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSaveField}>
                <i className="fas fa-plus"></i> {t('form.builder.add.field.button')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationFormBuilder;

