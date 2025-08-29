import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ApplicationPayment = () => {
  const { applicationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({
    applicationId: applicationId,
    planId: location.state?.planId,
    amount: location.state?.amount || 0,
    planName: location.state?.planName || '',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardholderName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'US'
  });

  useEffect(() => {
    if (!applicationId || !location.state) {
      setError('Invalid payment session. Please submit your application again.');
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [applicationId, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentData(prev => ({
      ...prev,
      paymentMethod: method
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const paymentPayload = {
        applicationId: parseInt(applicationId),
        planId: parseInt(paymentData.planId),
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        paymentDetails: {
          cardNumber: paymentData.cardNumber,
          cardExpiry: paymentData.cardExpiry,
          cardCvv: paymentData.cardCvv,
          cardholderName: paymentData.cardholderName,
          billingAddress: paymentData.billingAddress,
          billingCity: paymentData.billingCity,
          billingState: paymentData.billingState,
          billingZip: paymentData.billingZip,
          billingCountry: paymentData.billingCountry
        }
      };

      const response = await api.post('/public/application-payment', paymentPayload);
      
      alert('Payment processed successfully! Your application has been submitted.');
      navigate('/browse-memberships');
      
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
        <p>Loading payment form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-error">
        <h2>Payment Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/browse-memberships')} className="btn btn-primary">
          Back to Memberships
        </button>
      </div>
    );
  }

  return (
    <div className="application-payment-container">
      <div className="payment-header">
        <h1>Application Payment</h1>
        <p>Complete your membership application by paying the application fee</p>
      </div>

      <div className="payment-summary">
        <h3>Payment Summary</h3>
        <div className="summary-item">
          <span>Plan:</span>
          <span>{paymentData.planName}</span>
        </div>
        <div className="summary-item">
          <span>Application Fee:</span>
          <span>${paymentData.amount.toFixed(2)}</span>
        </div>
        <div className="summary-total">
          <span>Total:</span>
          <span>${paymentData.amount.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="payment-methods">
          <h3>Payment Method</h3>
          <div className="method-options">
            <label className="method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentData.paymentMethod === 'card'}
                onChange={() => handlePaymentMethodChange('card')}
              />
              <span>Credit/Debit Card</span>
            </label>
            <label className="method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="crypto"
                checked={paymentData.paymentMethod === 'crypto'}
                onChange={() => handlePaymentMethodChange('crypto')}
              />
              <span>Cryptocurrency</span>
            </label>
          </div>
        </div>

        {paymentData.paymentMethod === 'card' && (
          <div className="card-payment-section">
            <h3>Card Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Card Number *</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  required
                  maxLength="19"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date *</label>
                <input
                  type="text"
                  name="cardExpiry"
                  value={paymentData.cardExpiry}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  required
                  maxLength="5"
                />
              </div>
              <div className="form-group">
                <label>CVV *</label>
                <input
                  type="text"
                  name="cardCvv"
                  value={paymentData.cardCvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                  maxLength="4"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Cardholder Name *</label>
              <input
                type="text"
                name="cardholderName"
                value={paymentData.cardholderName}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>

            <h3>Billing Address</h3>
            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="billingAddress"
                value={paymentData.billingAddress}
                onChange={handleInputChange}
                placeholder="123 Main St"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="billingCity"
                  value={paymentData.billingCity}
                  onChange={handleInputChange}
                  placeholder="New York"
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="billingState"
                  value={paymentData.billingState}
                  onChange={handleInputChange}
                  placeholder="NY"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ZIP Code *</label>
                <input
                  type="text"
                  name="billingZip"
                  value={paymentData.billingZip}
                  onChange={handleInputChange}
                  placeholder="10001"
                  required
                />
              </div>
              <div className="form-group">
                <label>Country *</label>
                <select
                  name="billingCountry"
                  value={paymentData.billingCountry}
                  onChange={handleInputChange}
                  required
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {paymentData.paymentMethod === 'crypto' && (
          <div className="crypto-payment-section">
            <h3>Cryptocurrency Payment</h3>
            <p>You will be redirected to complete your cryptocurrency payment.</p>
            <div className="crypto-info">
              <p><strong>Supported cryptocurrencies:</strong> Bitcoin, Ethereum, Litecoin</p>
              <p><strong>Payment amount:</strong> ${paymentData.amount.toFixed(2)} USD</p>
            </div>
          </div>
        )}

        <div className="payment-actions">
          <button
            type="button"
            onClick={() => navigate('/browse-memberships')}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Processing Payment...' : `Pay $${paymentData.amount.toFixed(2)}`}
          </button>
        </div>
      </form>

      <style jsx>{`
        .application-payment-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
        }

        .payment-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .payment-header h1 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .payment-header p {
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .payment-summary {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .payment-summary h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: #7f8c8d;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #dee2e6;
          font-weight: bold;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .payment-form {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 30px;
        }

        .payment-methods {
          margin-bottom: 30px;
        }

        .payment-methods h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
        }

        .method-options {
          display: flex;
          gap: 20px;
        }

        .method-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 10px;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          transition: border-color 0.3s ease;
        }

        .method-option:hover {
          border-color: #3498db;
        }

        .method-option input[type="radio"] {
          margin: 0;
        }

        .card-payment-section,
        .crypto-payment-section {
          margin-bottom: 30px;
        }

        .card-payment-section h3,
        .crypto-payment-section h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #2c3e50;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3498db;
        }

        .crypto-info {
          background: #e8f4fd;
          border-radius: 6px;
          padding: 15px;
          margin-top: 15px;
        }

        .crypto-info p {
          margin: 5px 0;
          color: #2c3e50;
        }

        .payment-actions {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-top: 30px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2980b9;
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #7f8c8d;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .payment-loading,
        .payment-error {
          text-align: center;
          padding: 50px;
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
          .application-payment-container {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .method-options {
            flex-direction: column;
          }

          .payment-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ApplicationPayment;

