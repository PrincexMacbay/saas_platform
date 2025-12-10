import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const ApplyMembership = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState(null);
  const [plan, setPlan] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [incompleteApplication, setIncompleteApplication] = useState(null);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    fetchPlanAndForm();
  }, [planId]);

  const fetchPlanAndForm = async () => {
    try {
      setLoading(true);
      
      // First get the plan details
      const planResponse = await api.get(`/public/plans`);
      const plans = planResponse.data.data;
      const selectedPlan = plans.find(p => p.id === parseInt(planId));
      
      console.log('Selected plan:', selectedPlan); // Debug log
      
      if (!selectedPlan) {
        throw new Error('Plan not found');
      }
      
      setPlan(selectedPlan);
      
      // Check if the current user is the plan creator
      if (user && selectedPlan.createdBy === user.id) {
        setError(t('membership.apply.plan.creator.error'));
        setLoading(false);
        setTimeout(() => {
          navigate('/browse-memberships');
        }, 3000);
        return;
      }
      
      // Get the application form based on plan configuration
      let formResponse;
      
      console.log('Plan form config:', {
        applicationFormId: selectedPlan.applicationFormId,
        useDefaultForm: selectedPlan.useDefaultForm,
        organizationId: selectedPlan.organizationId
      }); // Debug log
      
      if (selectedPlan.applicationFormId && !selectedPlan.useDefaultForm) {
        // Use plan-specific form
        formResponse = await api.get(`/public/application-form/plan/${selectedPlan.applicationFormId}`);
      } else if (selectedPlan.organizationId) {
        // Use organization's default form
        formResponse = await api.get(`/public/application-form/${selectedPlan.organizationId}`);
      } else {
        // If no organization, try to get a default form
        console.log('Fetching default form'); // Debug log
        formResponse = await api.get('/public/application-form');
      }
      
      console.log('Form response:', formResponse.data); // Debug log
      
      setForm(formResponse.data.data);
      
      // Initialize form data with default values
      const initialData = {
        planId: parseInt(planId),
        applicationFee: selectedPlan.applicationFee || 0
      };
      
      // Add fields from the custom form
      if (formResponse.data.data.fields) {
        console.log('Form fields:', formResponse.data.data.fields); // Debug log
        formResponse.data.data.fields.forEach(field => {
          initialData[field.name] = '';
        });
      }
      
      console.log('Initial form data:', initialData); // Debug log
      setFormData(initialData);
      
    } catch (error) {
      console.error('Error fetching plan and form:', error);
      setError(error.response?.data?.message || 'Failed to load application form');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Check for incomplete applications when email is entered
    if (name === 'email' && value && value.includes('@')) {
      checkIncompleteApplications(value);
    }
  };

  const checkIncompleteApplications = async (email) => {
    try {
      const response = await api.get(`/public/incomplete-applications/${encodeURIComponent(email)}`);
      const applications = response.data.data.applications;
      
      // Filter applications for the current plan
      const currentPlanIncomplete = applications.find(app => app.planId === parseInt(planId));
      
      if (currentPlanIncomplete) {
        setIncompleteApplication(currentPlanIncomplete);
        setShowIncompleteModal(true);
      }
    } catch (error) {
      // Silently handle errors - this is just a check
      console.log('No incomplete applications found or error occurred');
    }
  };

  const handleContinueIncomplete = () => {
    // Pre-fill the form with the incomplete application data
    if (incompleteApplication.formData) {
      try {
        const savedFormData = JSON.parse(incompleteApplication.formData);
        setFormData(prev => ({
          ...prev,
          ...savedFormData
        }));
      } catch (e) {
        console.error('Error parsing saved form data:', e);
      }
    }
    setShowIncompleteModal(false);
  };

  const handleStartNew = () => {
    setIncompleteApplication(null);
    setShowIncompleteModal(false);
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const response = await api.post('/public/validate-coupon', {
        couponCode: couponCode.trim(),
        planId: parseInt(planId)
      });

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        setCouponError('');
      } else {
        setCouponError(response.data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Error validating coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const calculateDiscountedAmount = () => {
    if (!plan || !appliedCoupon) return plan?.fee || 0;
    
    const originalAmount = parseFloat(plan.fee);
    let discountAmount = 0;

    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (originalAmount * parseFloat(appliedCoupon.discount)) / 100;
    } else if (appliedCoupon.discountType === 'fixed') {
      discountAmount = parseFloat(appliedCoupon.discount);
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);
    return finalAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!agreedToTerms && form.terms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        planId: parseInt(planId),
        formData: JSON.stringify(formData),
        couponCode: appliedCoupon ? appliedCoupon.couponId : null,
        couponId: appliedCoupon ? appliedCoupon.id : null
      };

      const response = await api.post('/public/apply', submitData);
      
      // Check if this is an incomplete application being continued
      if (response.data.data.isIncomplete) {
        // User is continuing an incomplete application
        const finalAmount = calculateDiscountedAmount();
        if (finalAmount > 0) {
          // Redirect to payment page
          navigate(`/payment/application/${response.data.data.applicationId}`, {
            state: {
              applicationId: response.data.data.applicationId,
              planId: planId,
              amount: finalAmount,
              originalAmount: plan.fee,
              planName: plan.name,
              appliedCoupon: appliedCoupon
            }
          });
        } else {
          // Free plan - show success message
          alert(`Application completed successfully! Application ID: ${response.data.data.applicationId}`);
          navigate('/browse-memberships');
        }
      } else {
        // New application
        const finalAmount = calculateDiscountedAmount();
        if (finalAmount > 0) {
          // Redirect to payment page
          navigate(`/payment/application/${response.data.data.applicationId}`, {
            state: {
              applicationId: response.data.data.applicationId,
              planId: planId,
              amount: finalAmount,
              originalAmount: plan.fee,
              planName: plan.name,
              appliedCoupon: appliedCoupon
            }
          });
        } else {
          // Free plan - show success message
          alert(`Application submitted successfully! Application ID: ${response.data.data.applicationId}`);
          navigate('/browse-memberships');
        }
      }
      
    } catch (error) {
      console.error('Submit application error:', error);
      alert('Error submitting application: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const { name, label, type, required, placeholder, options } = field;
    
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            value={formData[name] || ''}
            onChange={handleInputChange}
            required={required}
            className="form-control"
          >
            <option value="">{t('membership.apply.select.field', { field: label })}</option>
            {options?.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            name={name}
            value={formData[name] || ''}
            onChange={handleInputChange}
            placeholder={placeholder || t('membership.apply.enter.field', { field: label.toLowerCase() })}
            required={required}
            className="form-control"
            rows={4}
          />
        );
      
      case 'checkbox':
        return (
          <label className="checkbox-label">
            <input
              type="checkbox"
              name={name}
              checked={formData[name] || false}
              onChange={handleInputChange}
              required={required}
            />
            {label}
          </label>
        );
      
      default:
        return (
          <input
            type={type || 'text'}
            name={name}
            value={formData[name] || ''}
            onChange={handleInputChange}
            placeholder={placeholder || t('membership.apply.enter.field', { field: label.toLowerCase() })}
            required={required}
            className="form-control"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="apply-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apply-error">
        <h2>{t('common.error')}</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/browse-memberships')} className="btn btn-primary">
          {t('common.back')} {t('nav.browse.memberships')}
        </button>
      </div>
    );
  }

  if (!form || !plan) {
    return (
      <div className="apply-error">
        <h2>{t('membership.apply.form.not.available')}</h2>
        <p>{t('membership.apply.form.not.available.desc')}</p>
        <button onClick={() => navigate('/browse-memberships')} className="btn btn-primary">
          {t('common.back')} {t('nav.browse.memberships')}
        </button>
      </div>
    );
  }

  console.log('Rendering form with:', { form, formData }); // Debug log
  
  return (
    <div className="apply-membership">
      <div className="apply-header">
        <h1>{form.title}</h1>
        <div className="plan-info">
          <h2>{plan.name}</h2>
          <p><strong>{t('membership.apply.organization')}:</strong> {plan.organization?.name}</p>
          <p><strong>{t('membership.apply.fee')}:</strong> ${plan.fee} {plan.renewalInterval}</p>
          {plan.applicationFee > 0 && (
            <p><strong>{t('membership.apply.application.fee')}:</strong> ${plan.applicationFee}</p>
          )}
        </div>
        {form.description && (
          <div className="form-description">
            <p>{form.description}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-fields">
          {form.fields?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((field, index) => (
            <div key={index} className="form-group">
              <label className="form-label">
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>

        {/* Coupon Code Section */}
        {plan.fee > 0 && (
          <div className="coupon-section">
            <h3>{t('membership.coupons')} ({t('common.optional')})</h3>
            <div className="coupon-input-group">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="form-control coupon-input"
                disabled={appliedCoupon}
              />
              {!appliedCoupon ? (
                <button
                  type="button"
                  onClick={validateCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="btn btn-secondary"
                >
                  {validatingCoupon ? 'Validating...' : 'Apply Coupon'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="btn btn-outline-secondary"
                >
                  Remove
                </button>
              )}
            </div>
            
            {couponError && (
              <div className="coupon-error">
                <p className="error-text">{couponError}</p>
              </div>
            )}
            
            {appliedCoupon && (
              <div className="coupon-success">
                <p className="success-text">
                  ✅ Coupon "{appliedCoupon.name}" applied! 
                  {appliedCoupon.discountType === 'percentage' 
                    ? ` ${appliedCoupon.discount}% off`
                    : ` $${appliedCoupon.discount} off`
                  }
                </p>
                <div className="price-breakdown">
                  <p>Original Price: <span className="original-price">${plan.fee}</span></p>
                  <p>Discount: <span className="discount-amount">-${(plan.fee - calculateDiscountedAmount()).toFixed(2)}</span></p>
                  <p><strong>Final Price: <span className="final-price">${calculateDiscountedAmount().toFixed(2)}</span></strong></p>
                </div>
              </div>
            )}
          </div>
        )}

        {form.terms && (
          <div className="terms-section">
            <h3>Terms and Conditions</h3>
            <div className="terms-content">
              <p>{form.terms}</p>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
              />
              I agree to the terms and conditions
            </label>
          </div>
        )}

        {form.agreement && (
          <div className="agreement-section">
            <div className="agreement-content">
              <p>{form.agreement}</p>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/browse-memberships')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || (form.terms && !agreedToTerms)}
            className="btn btn-primary"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>

        {form.footer && (
          <div className="form-footer">
            <p>{form.footer}</p>
          </div>
        )}
      </form>

      {/* Incomplete Application Modal */}
      {showIncompleteModal && incompleteApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Continue Previous Application?</h3>
            <p>
              We found an incomplete application for <strong>{plan.name}</strong> with the email <strong>{incompleteApplication.email}</strong>.
            </p>
            <p>Would you like to continue with your previous application or start a new one?</p>
            
            <div className="modal-actions">
              <button
                onClick={handleContinueIncomplete}
                className="btn btn-primary"
              >
                Continue Previous Application
              </button>
              <button
                onClick={handleStartNew}
                className="btn btn-secondary"
              >
                Start New Application
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .apply-membership {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .apply-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .apply-header h1 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .plan-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .plan-info h2 {
          color: #3498db;
          margin-bottom: 10px;
        }

        .plan-info p {
          margin: 5px 0;
          color: #555;
        }

        .form-description {
          margin-top: 20px;
        }

        .application-form {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .form-fields {
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c3e50;
        }

        .required {
          color: #e74c3c;
          margin-left: 4px;
        }

        .form-control {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-control:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          margin-top: 2px;
        }

        .terms-section,
        .agreement-section {
          margin: 30px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .terms-section h3 {
          margin-bottom: 15px;
          color: #2c3e50;
        }

        .terms-content,
        .agreement-content {
          background: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 15px;
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #ddd;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin: 30px 0;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2980b9;
        }

        .btn-primary:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
        }

        .form-footer {
          text-align: center;
          margin-top: 20px;
          color: #7f8c8d;
          font-style: italic;
        }

        .apply-loading,
        .apply-error {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Coupon Section Styles */
        .coupon-section {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        .coupon-section h3 {
          margin: 0 0 15px 0;
          color: #495057;
          font-size: 1.1rem;
        }

        .coupon-input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .coupon-input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }

        .coupon-input:disabled {
          background-color: #e9ecef;
          color: #6c757d;
        }

        .coupon-error {
          margin-top: 10px;
        }

        .error-text {
          color: #dc3545;
          font-size: 14px;
          margin: 0;
        }

        .coupon-success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 4px;
          padding: 15px;
          margin-top: 15px;
        }

        .success-text {
          color: #155724;
          font-weight: 500;
          margin: 0 0 10px 0;
        }

        .price-breakdown {
          background: white;
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
        }

        .price-breakdown p {
          margin: 5px 0;
          font-size: 14px;
        }

        .original-price {
          text-decoration: line-through;
          color: #6c757d;
        }

        .discount-amount {
          color: #28a745;
          font-weight: 500;
        }

        .final-price {
          color: #007bff;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .apply-membership {
            padding: 10px;
          }

          .application-form {
            padding: 20px;
          }

          .form-actions {
            flex-direction: column;
          }
        }

        /* Modal Styles */
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
          padding: 30px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .modal-content h3 {
          color: #2c3e50;
          margin-bottom: 15px;
        }

        .modal-content p {
          color: #555;
          margin-bottom: 15px;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 25px;
        }

        .modal-actions .btn {
          min-width: 180px;
        }

        @media (max-width: 768px) {
          .modal-content {
            padding: 20px;
            margin: 20px;
          }

          .modal-actions {
            flex-direction: column;
          }

          .modal-actions .btn {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default ApplyMembership;
