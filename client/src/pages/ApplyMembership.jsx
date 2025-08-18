import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ApplyMembership = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [plan, setPlan] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
      
      if (!selectedPlan) {
        throw new Error('Plan not found');
      }
      
      setPlan(selectedPlan);
      
      // Then get the application form for this organization
      const formResponse = await api.get(`/public/application-form/${selectedPlan.organizationId}`);
      setForm(formResponse.data.data);
      
      // Initialize form data with default values
      const initialData = {
        planId: parseInt(planId),
        applicationFee: selectedPlan.applicationFee || 0
      };
      
      // Add fields from the custom form
      if (formResponse.data.data.fields) {
        formResponse.data.data.fields.forEach(field => {
          initialData[field.name] = '';
        });
      }
      
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
        formData: JSON.stringify(formData)
      };

      const response = await api.post('/public/apply', submitData);
      
      alert(`Application submitted successfully! Application ID: ${response.data.data.applicationId}`);
      navigate('/browse-memberships');
      
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
            <option value="">Select {label}</option>
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
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
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
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
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
        <p>Loading application form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apply-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/browse-memberships')} className="btn btn-primary">
          Back to Memberships
        </button>
      </div>
    );
  }

  if (!form || !plan) {
    return (
      <div className="apply-error">
        <h2>Form Not Available</h2>
        <p>The application form for this membership is not currently available.</p>
        <button onClick={() => navigate('/browse-memberships')} className="btn btn-primary">
          Back to Memberships
        </button>
      </div>
    );
  }

  return (
    <div className="apply-membership">
      <div className="apply-header">
        <h1>{form.title}</h1>
        <div className="plan-info">
          <h2>{plan.name}</h2>
          <p><strong>Organization:</strong> {plan.organization?.name}</p>
          <p><strong>Fee:</strong> ${plan.fee} {plan.renewalInterval}</p>
          {plan.applicationFee > 0 && (
            <p><strong>Application Fee:</strong> ${plan.applicationFee}</p>
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
      `}</style>
    </div>
  );
};

export default ApplyMembership;
