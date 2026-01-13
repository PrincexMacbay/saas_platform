import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import ConfirmDialog from '../ConfirmDialog';
import { useMembershipData } from '../../contexts/MembershipDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotificationModal } from '../../contexts/NotificationModalContext';

// Plan Modal Component
const PlanModal = ({ plan, onClose, onSave }) => {
  const { t } = useLanguage();
  const { showError, showSuccess } = useNotificationModal();
  console.log('PlanModal rendering with plan:', plan);
  
  // Initialize form data with safe defaults
  const [formData, setFormData] = useState(() => {
    try {
      return {
        name: plan?.name || '',
        description: plan?.description || '',
        planType: plan?.fee === 0 || plan?.fee === '0' ? 'free' : 'paid',
        fee: plan?.fee || '',
        renewalInterval: plan?.renewalInterval || 'monthly',
        maxMembers: plan?.maxMembers || '',
        useDefaultForm: plan?.useDefaultForm !== false,
        applicationFormId: plan?.applicationFormId || null,
        hasGroupChat: plan?.hasGroupChat || false,
        benefits: (() => {
          if (!plan?.benefits) return [''];
          try {
            return JSON.parse(plan.benefits);
          } catch (e) {
            console.warn('Invalid benefits JSON for plan in modal:', plan?.id || 'new plan', plan.benefits);
            return [''];
          }
        })()
      };
    } catch (error) {
      console.error('Error initializing form data:', error);
      return {
        name: '',
        description: '',
        planType: 'free',
        fee: '',
        renewalInterval: 'monthly',
        maxMembers: '',
        useDefaultForm: true,
        applicationFormId: null,
        hasGroupChat: false,
        benefits: ['']
      };
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [availableForms, setAvailableForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(false);

  // Fetch available application forms
  const fetchAvailableForms = async () => {
    try {
      setLoadingForms(true);
      const response = await api.get('/membership/application-forms');
      // Only show published forms for selection
      const forms = response.data?.data || [];
      const publishedForms = Array.isArray(forms) ? forms.filter(form => form.isPublished) : [];
      setAvailableForms(publishedForms);
    } catch (error) {
      console.error('Error fetching application forms:', error);
      setAvailableForms([]); // Set empty array on error
    } finally {
      setLoadingForms(false);
    }
  };

  // Fetch forms when component mounts or when plan changes
  useEffect(() => {
    try {
      fetchAvailableForms();
    } catch (error) {
      console.error('Error in fetchAvailableForms useEffect:', error);
    }
  }, [plan?.id]); // Refresh when editing a different plan

  // Listen for form updates from other components
  useEffect(() => {
    try {
      const handleFormUpdate = () => {
        fetchAvailableForms();
      };

      // Add event listener for form updates
      window.addEventListener('formUpdated', handleFormUpdate);
      
      return () => {
        window.removeEventListener('formUpdated', handleFormUpdate);
      };
    } catch (error) {
      console.error('Error in form update listener useEffect:', error);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const addBenefit = () => {
    setFormData(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
  };

  const removeBenefit = (index) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        benefits: formData.benefits.filter(benefit => benefit.trim())
      };

      // Debug logging
      console.log('Submitting plan data:', submitData);
      console.log('useDefaultForm:', submitData.useDefaultForm);
      console.log('applicationFormId:', submitData.applicationFormId);

      if (plan) {
        await api.put(`/membership/plans/${plan.id}`, submitData);
      } else {
        await api.post('/membership/plans', submitData);
      }
      
      onSave();
    } catch (error) {
      console.error('Plan submission error:', error.response?.data);
      alert(t('plans.error.saving', { error: error.response?.data?.message || error.message }));
    } finally {
      setLoading(false);
    }
  };

  console.log('PlanModal about to render return statement');
  
  return (
    <div className="modal-overlay" onClick={onClose} style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0, 0, 0, 0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 9999 
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        minWidth: '400px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>{plan ? t('plans.edit.modal') : t('plans.add.modal')}</h3>
          <button onClick={onClose} className="close-button" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>{t('plans.plan.name.label')} *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={t('plans.plan.name.placeholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('plans.description.label')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder={t('plans.description.placeholder')}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('plans.plan.type')} *</label>
              <div className="plan-type-selector">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="planType"
                    value="paid"
                    checked={formData.planType === 'paid'}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        planType: e.target.value,
                        fee: e.target.value === 'free' ? '0' : prev.fee
                      }));
                    }}
                  />
                  <span>{t('plans.paid')}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="planType"
                    value="free"
                    checked={formData.planType === 'free'}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        planType: e.target.value,
                        fee: e.target.value === 'free' ? '0' : prev.fee
                      }));
                    }}
                  />
                  <span>{t('plans.free')}</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>{t('plans.fee.label')} {formData.planType === 'paid' ? '*' : ''}</label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                step="0.01"
                min="0"
                required={formData.planType === 'paid'}
                disabled={formData.planType === 'free'}
                placeholder={formData.planType === 'free' ? t('plans.free') : t('plans.fee.placeholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('plans.renewal.interval.label')} *</label>
              <select
                name="renewalInterval"
                value={formData.renewalInterval}
                onChange={handleChange}
                required
              >
                <option value="monthly">{t('plans.monthly')}</option>
                <option value="quarterly">{t('plans.quarterly')}</option>
                <option value="yearly">{t('plans.yearly')}</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t('plans.max.members.label')} (optional)</label>
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              min="1"
              placeholder={t('plans.unlimited')}
            />
          </div>

          <div className="form-group">
            <label>{t('plans.application.form')}</label>
            <div className="form-type-selector">
              <label className="radio-label">
                <input
                  type="radio"
                  name="useDefaultForm"
                  value="default"
                  checked={formData.useDefaultForm === true}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      useDefaultForm: true,
                      applicationFormId: null
                    }));
                  }}
                />
                <span>{t('plans.use.default.form')}</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="useDefaultForm"
                  value="custom"
                  checked={formData.useDefaultForm === false}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      useDefaultForm: false
                    }));
                  }}
                />
                <span>{t('plans.select.form')}</span>
              </label>
            </div>
            
            {!formData.useDefaultForm && (
              <div className="form-group">
                <label>{t('plans.select.form')}</label>
                {availableForms.length === 0 ? (
                  <div className="form-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{t('forms.no.forms')}</p>
                    <button 
                      type="button" 
                      className="create-form-button"
                      onClick={() => {
                        // Navigate to application forms management
                        window.location.href = '/membership/application-form';
                      }}
                    >
                      Create Application Form
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="form-select-container">
                      <select
                        name="applicationFormId"
                        value={formData.applicationFormId || ''}
                        onChange={handleChange}
                        required={!formData.useDefaultForm}
                        disabled={loadingForms}
                      >
                        <option value="">{loadingForms ? 'Loading forms...' : 'Select a form...'}</option>
                        {availableForms.map(form => (
                          <option key={form.id} value={form.id}>
                            {form.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={fetchAvailableForms}
                        disabled={loadingForms}
                        className="refresh-forms-button"
                        title="Refresh available forms"
                      >
                        <i className={`fas ${loadingForms ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                      </button>
                    </div>
                    <div style={{ 
                      background: '#e8f4f8', 
                      border: '1px solid #bee5eb', 
                      borderRadius: '6px', 
                      padding: '12px', 
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#0c5460'
                    }}>
                      <strong>💡 Form Selection Guide:</strong>
                      <ul style={{ margin: '8px 0 0 20px', padding: 0, lineHeight: '1.6' }}>
                        <li><strong>Available forms:</strong> Both general forms (for all plans) and plan-specific forms are shown.</li>
                        <li><strong>General forms:</strong> Can be used by multiple plans. Create these in the Application Form Builder without selecting a plan.</li>
                        <li><strong>Plan-specific forms:</strong> Created for a specific plan. These are only available if you've already created the plan and then built a form for it.</li>
                        <li><strong>Workflow:</strong> Create a general form first → Create your plan → Optionally create plan-specific forms later.</li>
                      </ul>
                      <small style={{ display: 'block', marginTop: '8px', fontStyle: 'italic' }}>
                        Only published forms are available for selection. Click the refresh button to update the list.
                      </small>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>{t('plans.benefits')}</label>
            <div className="benefits-list">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    placeholder={t('plans.benefits.placeholder')}
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="remove-benefit"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addBenefit}
                className="add-benefit"
              >
                <i className="fas fa-plus"></i> {t('plans.add.benefit')}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="hasGroupChat"
                checked={formData.hasGroupChat}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, hasGroupChat: e.target.checked }));
                }}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              <span>Enable group chat for this plan</span>
            </label>
            <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '12px' }}>
              When enabled, a group chat will be automatically created for all plan members. New members will be automatically added to the chat.
            </small>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              {t('plans.cancel')}
            </button>
            <button type="submit" disabled={loading} className="save-button">
              {loading ? t('plans.saving') : t('plans.save.plan')}
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
            z-index: 9999;
            width: 100vw;
            height: 100vh;
            overflow: auto;
          }

          .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            margin: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            border-bottom: 1px solid #ecf0f1;
            background: #2c3e50;
            color: white;
          }

          .modal-header h3 {
            margin: 0;
            color: white;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: white;
            cursor: pointer;
          }

          .modal-form {
            padding: 30px;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
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
          .form-group select,
          .form-group textarea {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
          }

          .benefits-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .benefit-item {
            display: flex;
            gap: 10px;
            align-items: center;
          }

          .benefit-item input {
            flex: 1;
          }

          .remove-benefit {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
          }

          .add-benefit {
            background: #3498db;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.3s ease;
          }

          .add-benefit:hover {
            background: #2980b9;
          }

          .checkbox-group {
            margin-bottom: 10px;
          }

          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            color: #555;
          }

          .checkbox-label input[type="checkbox"] {
            margin: 0;
            width: 16px;
            height: 16px;
          }

          .checkbox-label span {
            user-select: none;
          }

          .form-group select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
            background: white;
          }

          .form-group select:disabled {
            background: #f8f9fa;
            color: #6c757d;
            cursor: not-allowed;
          }

          .plan-type-selector {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
          }

          .radio-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            color: #555;
            padding: 8px 12px;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            transition: all 0.3s ease;
          }

          .radio-label:hover {
            border-color: #3498db;
            background: #f8f9fa;
          }

          .radio-label input[type="radio"] {
            margin: 0;
            width: 16px;
            height: 16px;
            accent-color: #3498db;
          }

          .radio-label input[type="radio"]:checked + span {
            color: #3498db;
            font-weight: 500;
          }

          .radio-label input[type="radio"]:checked {
            border-color: #3498db;
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
            opacity: 0.5;
            cursor: not-allowed;
          }

          .form-warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
          }

          .form-warning i {
            color: #f39c12;
            font-size: 1.5rem;
            margin-bottom: 10px;
          }

          .form-warning p {
            margin: 10px 0;
            color: #856404;
            font-weight: 500;
          }

          .create-form-button {
            background: #3498db;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
            margin-top: 10px;
          }

          .create-form-button:hover {
            background: #2980b9;
          }

          .form-select-container {
            display: flex;
            gap: 10px;
            align-items: flex-start;
          }

          .form-select-container select {
            flex: 1;
          }

          .refresh-forms-button {
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 10px 12px;
            cursor: pointer;
            color: #6c757d;
            transition: all 0.3s ease;
            min-width: 44px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .refresh-forms-button:hover:not(:disabled) {
            background: #e9ecef;
            border-color: #adb5bd;
            color: #495057;
          }

          .refresh-forms-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .refresh-forms-button i {
            font-size: 1rem;
          }

          @media (max-width: 768px) {
            .form-row {
              grid-template-columns: 1fr;
            }
            
            .modal-content {
              width: 95%;
              max-height: 95vh;
              margin: 20px;
            }
            
            .modal-overlay {
              padding: 10px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

const Plans = () => {
  const { data, loading, errors, refreshData, updateData, isInitialized, isLoadingAll } = useMembershipData();
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotificationModal();
  const [plans, setPlans] = useState([]);
  // Use context loading state instead of local state
  const isLoading = loading.plans;
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });

  // Fetch plans function - defined before useEffect to avoid initialization error
  const fetchPlans = useCallback(async () => {
    try {
      setError(null);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(activeFilter && { isActive: activeFilter })
      };

      const response = await api.get('/membership/plans', { params });
      const plans = response.data?.data?.plans || [];
      const pagination = response.data?.data?.pagination || { totalPages: 1 };
      
      setPlans(plans);
      setTotalPages(pagination.totalPages);
      // Also update context data
      updateData('plans', plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError(error.response?.data?.message || 'Failed to fetch plans');
    }
  }, [currentPage, searchTerm, activeFilter, updateData]);

  useEffect(() => {
    // Use preloaded data if available
    if (data.plans && Array.isArray(data.plans)) {
      console.log('🚀 Plans: Using preloaded data', data.plans.length, 'plans');
      setPlans(data.plans);
      setError(null);
    } else if (!loading.plans && !isLoadingAll && isInitialized) {
      // Only fetch if not currently loading and not in global preload
      console.log('🚀 Plans: Fetching data (not preloaded)');
      fetchPlans();
    }
  }, [data.plans, loading.plans, isLoadingAll, isInitialized, fetchPlans]);

  useEffect(() => {
    // Fetch when filters or page change (debounce search for better performance)
    if (isInitialized) {
      const timeoutId = setTimeout(() => {
        console.log('🚀 Plans: Fetching due to filter/page changes', { searchTerm, activeFilter, currentPage });
        fetchPlans();
      }, searchTerm ? 500 : 0); // Debounce search by 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, searchTerm, activeFilter, isInitialized, fetchPlans]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleActiveFilter = (e) => {
    setActiveFilter(e.target.value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    if (amount === 0 || amount === '0' || amount === null || amount === undefined) {
      return t('plans.free');
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getRenewalText = (interval) => {
    const intervals = {
      monthly: t('plans.monthly'),
      quarterly: t('plans.quarterly'),
      yearly: t('plans.yearly'),
      'one-time': 'One-time'
    };
    return intervals[interval] || interval;
  };

  const handleAddPlan = () => {
    console.log('Add Plan button clicked');
    setEditingPlan(null);
    setShowModal(true);
    console.log('Modal should be showing now');
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDeletePlan = async (planId) => {
    setConfirmDialog({
      isOpen: true,
      message: t('plans.confirm.delete'),
      onConfirm: () => deletePlan(planId)
    });
  };

  const deletePlan = async (planId) => {
    try {
      await api.delete(`/membership/plans/${planId}`);
      // Refresh both local state and context data
      await refreshData('plans');
      await fetchPlans();
      setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      showSuccess(t('plans.deleted.success') || 'Plan deleted successfully', t('plans.success') || 'Success');
    } catch (error) {
      console.error('Delete plan error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete plan';
      showError(t('plans.error.deleting', { error: errorMessage }), t('plans.error.title') || 'Error');
    }
  };

  const togglePlanStatus = async (plan) => {
    try {
      await api.put(`/membership/plans/${plan.id}`, {
        ...plan,
        isActive: !plan.isActive
      });
      // Refresh both local state and context data
      await refreshData('plans');
      await fetchPlans();
    } catch (error) {
      showError(t('plans.error.saving', { error: error.response?.data?.message || error.message }), t('plans.error.title') || 'Error');
    }
  };


  // Use preloaded data if available, show minimal loading only if no data at all
  if (!plans.length && isLoading && !data.plans) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>{t('plans.loading')}</p>
      </div>
    );
  }

  return (
    <div className="plans-container">
      <div className="plans-header">
        <h2>{t('plans.title')}</h2>
        <button onClick={handleAddPlan} className="add-button">
          <i className="fas fa-plus"></i> {t('plans.add.plan')}
        </button>
      </div>

      <div className="plans-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder={t('plans.search.placeholder')}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <select
          value={activeFilter}
          onChange={handleActiveFilter}
          className="status-filter"
        >
          <option value="">{t('plans.all.plans')}</option>
          <option value="true">{t('plans.active.only')}</option>
          <option value="false">{t('plans.inactive')}</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="plans-grid">
        {Array.isArray(plans) && plans.map(plan => (
          <div key={plan.id} className={`plan-card ${!plan.isActive ? 'inactive' : ''}`}>
            <div className="plan-header">
              <div className="plan-title">
                <h3>{plan.name}</h3>
                <div className="plan-status">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={plan.isActive}
                      onChange={() => togglePlanStatus(plan)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className={`status-text ${plan.isActive ? 'active' : 'inactive'}`}>
                    {plan.isActive ? t('plans.active') : t('plans.inactive')}
                  </span>
                </div>
              </div>
              <div className="plan-actions">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="edit-button"
                  title={t('plans.edit.plan')}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="delete-button"
                  title={t('plans.delete.plan')}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div className="plan-content">
              <div className="plan-price">
                <span className={`price ${plan.fee === 0 || plan.fee === '0' ? 'free-price' : ''}`}>
                  {formatCurrency(plan.fee)}
                </span>
                <span className="interval">/{getRenewalText(plan.renewalInterval)}</span>
              </div>

              {plan.description && (
                <p className="plan-description">{plan.description}</p>
              )}

              <div className="plan-stats">
                <div className="stat">
                  <i className="fas fa-users"></i>
                  <span>{plan.activeSubscriptions || 0} Active</span>
                </div>
                <div className="stat">
                  <i className="fas fa-chart-line"></i>
                  <span>{plan.totalSubscriptions || 0} Total</span>
                </div>
                {plan.maxMembers && (
                  <div className="stat">
                    <i className="fas fa-limit"></i>
                    <span>Limit: {plan.maxMembers}</span>
                  </div>
                )}
              </div>

              {plan.benefits && (
                <div className="plan-benefits">
                  <h4>Benefits:</h4>
                  <ul>
                    {(() => {
                      let benefits = [];
                      
                      try {
                        // Handle case where benefits is already an array
                        if (Array.isArray(plan.benefits)) {
                          benefits = plan.benefits;
                        } 
                        // Handle case where benefits is a JSON string
                        else if (typeof plan.benefits === 'string') {
                          benefits = JSON.parse(plan.benefits || '[]');
                        }
                        // Handle other cases
                        else {
                          benefits = [];
                        }
                      } catch (e) {
                        console.warn('Invalid benefits JSON for plan:', plan.id, plan.benefits);
                        benefits = [];
                      }
                      
                      // Final safety check
                      if (!Array.isArray(benefits)) {
                        console.warn('Benefits is not an array for plan:', plan.id, benefits);
                        benefits = [];
                      }
                      
                      return benefits.map((benefit, index) => (
                        <li key={index}>
                          <i className="fas fa-check"></i>
                          {benefit}
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <div className="no-data">
          <i className="fas fa-layer-group"></i>
          <p>{t('plans.no.plans')}</p>
          <button onClick={handleAddPlan} className="add-first-button">
            {t('plans.create.first')}
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {showModal && (
        <PlanModal
          plan={editingPlan}
          onClose={() => {
            console.log('Closing modal');
            setShowModal(false);
          }}
          onSave={async () => {
            console.log('Saving plan');
            setShowModal(false);
            // Refresh both local state and context data
            await refreshData('plans');
            await fetchPlans();
          }}
        />
      )}

      <style jsx>{`
        .plans-container {
          padding: 1rem;
        }

        @media (min-width: 640px) {
          .plans-container {
            padding: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .plans-container {
            padding: 2rem;
          }
        }

        .plans-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 640px) {
          .plans-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 0;
          }
        }

        .plans-header h2 {
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

        .plans-filters {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 640px) {
          .plans-filters {
            flex-direction: row;
            gap: 1.25rem;
            align-items: center;
          }
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-box i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }

        .search-box input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .status-filter {
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          min-width: 150px;
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

        .plans-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 640px) {
          .plans-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .plans-grid {
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;
          }
        }

        .plan-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .plan-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .plan-card.inactive {
          opacity: 0.7;
          background: #f8f9fa;
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 25px 25px 15px 25px;
          border-bottom: 1px solid #ecf0f1;
        }

        .plan-title h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 1.3rem;
        }

        .plan-status {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
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
          background-color: #ccc;
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

        input:checked + .toggle-slider {
          background-color: #27ae60;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .status-text {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .status-text.active {
          color: #27ae60;
        }

        .status-text.inactive {
          color: #e74c3c;
        }

        .plan-actions {
          display: flex;
          gap: 8px;
        }

        .edit-button,
        .delete-button {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-button {
          background: #f8f9fa;
          color: #3498db;
        }

        .edit-button:hover {
          background: #3498db;
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

        .plan-content {
          padding: 25px;
        }

        .plan-price {
          margin-bottom: 20px;
        }

        .plan-price .price {
          font-size: 2.5rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .plan-price .price.free-price {
          color: #27ae60;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .plan-price .interval {
          font-size: 1rem;
          color: #7f8c8d;
          margin-left: 5px;
        }

        .plan-description {
          color: #7f8c8d;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .plan-stats {
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

        .plan-benefits h4 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          font-size: 1rem;
        }

        .plan-benefits ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .plan-benefits li {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          color: #34495e;
          font-size: 0.9rem;
        }

        .plan-benefits li i {
          color: #27ae60;
          font-size: 0.8rem;
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

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
        }

        .pagination-button {
          background: #f8f9fa;
          border: 1px solid #ddd;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-button:hover:not(:disabled) {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-weight: 500;
          color: #7f8c8d;
        }

        @media (max-width: 639px) {
          .plan-header {
            flex-direction: column;
            gap: 1rem;
          }

          .plan-stats {
            flex-direction: column;
            gap: 0.75rem;
          }

          .plan-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
        confirmText={t('plans.delete')}
        cancelText={t('plans.cancel')}
      />
    </div>
  );
};


export default Plans;
