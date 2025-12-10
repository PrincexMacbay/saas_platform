import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CryptoPayment = ({ amount, planId, subscriptionId, description, onSuccess, onCancel }) => {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await api.get('/membership/payments/crypto/currencies');
      setCurrencies(response.data.data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const createPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/membership/payments/crypto', {
        amount: amount,
        currency: selectedCurrency,
        planId: planId,
        subscriptionId: subscriptionId,
        description: description || 'Membership Payment'
      });

      setPaymentData(response.data.data);
      setPaymentStatus('created');
    } catch (error) {
      console.error('Error creating crypto payment:', error);
      setError(error.response?.data?.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.payment?.id) return;

    try {
      const response = await api.get(`/membership/payments/crypto/${paymentData.payment.id}/status`);
      const status = response.data.data.cryptoStatus.status;
      const gateway = response.data.data.cryptoStatus.gateway;
      
      // Handle both BTCPay and NowPayments status values
      const isCompleted = gateway === 'btcpay' ? 
        status === 'Settled' : 
        ['confirmed', 'finished'].includes(status);
      
      const isExpired = gateway === 'btcpay' ? 
        status === 'Expired' : 
        status === 'expired';
      
      if (isCompleted) {
        setPaymentStatus('completed');
        onSuccess && onSuccess(response.data.data.payment);
      } else if (isExpired) {
        setPaymentStatus('expired');
      } else {
        setPaymentStatus('pending');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  useEffect(() => {
    if (paymentStatus === 'created') {
      const interval = setInterval(checkPaymentStatus, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [paymentStatus, paymentData]);

  const formatCryptoAmount = (amount, currency) => {
    const rates = {
      BTC: 45000,
      LTC: 150,
      ETH: 3000,
      BCH: 400,
      XMR: 200
    };
    
    const rate = rates[currency] || 1;
    const cryptoAmount = amount / rate;
    
    return cryptoAmount.toFixed(8);
  };

  if (paymentStatus === 'completed') {
    return (
      <div className="crypto-payment-success">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h3>Payment Completed!</h3>
        <p>Your crypto payment has been successfully processed.</p>
        <button className="btn btn-primary" onClick={() => onSuccess && onSuccess()}>
          Continue
        </button>
      </div>
    );
  }

  if (paymentStatus === 'expired') {
    return (
      <div className="crypto-payment-expired">
        <div className="expired-icon">
          <i className="fas fa-times-circle"></i>
        </div>
        <h3>Payment Expired</h3>
        <p>The payment window has expired. Please try again.</p>
        <button className="btn btn-primary" onClick={() => setPaymentStatus('pending')}>
          Try Again
        </button>
      </div>
    );
  }

  if (paymentStatus === 'created' && paymentData) {
    return (
      <div className="crypto-payment-details">
        <div className="payment-header">
          <h3>Crypto Payment</h3>
          <p>Please complete your payment using the information below:</p>
        </div>

        <div className="payment-info">
          <div className="info-row">
            <span>Amount:</span>
            <span>${amount} USD</span>
          </div>
          <div className="info-row">
            <span>Crypto Amount:</span>
            <span>{formatCryptoAmount(amount, selectedCurrency)} {selectedCurrency}</span>
          </div>
          <div className="info-row">
            <span>Payment Address:</span>
            <span className="payment-address">{paymentData.cryptoInvoice.paymentAddress}</span>
          </div>
        </div>

        <div className="payment-actions">
          <a 
            href={paymentData.cryptoInvoice.paymentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <i className="fas fa-external-link-alt"></i> Pay with {selectedCurrency}
          </a>
          
          <button className="btn btn-secondary" onClick={checkPaymentStatus}>
            <i className="fas fa-sync-alt"></i> Check Status
          </button>
        </div>

        <div className="payment-status">
          <p>Status: <span className="status-pending">Pending Payment</span></p>
          <p className="status-note">Please complete the payment and click "Check Status" to confirm.</p>
        </div>

        <button className="btn btn-outline" onClick={onCancel}>
          Cancel Payment
        </button>
      </div>
    );
  }

  return (
    <div className="crypto-payment-form">
      <div className="payment-header">
        <h3>Pay with Cryptocurrency</h3>
        <p>Select your preferred cryptocurrency to complete the payment.</p>
        <div className="gateway-info">
          <small>Powered by NowPayments</small>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="payment-details">
        <div className="info-row">
          <span>Amount:</span>
          <span>${amount} USD</span>
        </div>
        <div className="info-row">
          <span>Description:</span>
          <span>{description || 'Membership Payment'}</span>
        </div>
      </div>

      <div className="currency-selection">
        <label>Select Cryptocurrency:</label>
        <div className="currency-options">
          {currencies.map((currency) => (
            <div 
              key={currency.code}
              className={`currency-option ${selectedCurrency === currency.code ? 'selected' : ''}`}
              onClick={() => setSelectedCurrency(currency.code)}
            >
              <span className="currency-symbol">{currency.symbol}</span>
              <span className="currency-name">{currency.name}</span>
              <span className="currency-code">{currency.code}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="estimated-amount">
        <p>Estimated Amount: <strong>{formatCryptoAmount(amount, selectedCurrency)} {selectedCurrency}</strong></p>
        <small>* Exchange rates are approximate and may vary</small>
      </div>

      <div className="payment-actions">
        <button 
          className="btn btn-primary" 
          onClick={createPayment}
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Creating Payment...
            </>
          ) : (
            <>
              <i className="fas fa-credit-card"></i> Pay with {selectedCurrency}
            </>
          )}
        </button>
        
        <button className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <style jsx>{`
        .crypto-payment-form,
        .crypto-payment-details,
        .crypto-payment-success,
        .crypto-payment-expired {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          margin: 0 auto;
        }

        .payment-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .payment-header h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }

        .payment-header p {
          color: #7f8c8d;
          margin: 0;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .payment-details,
        .payment-info {
          margin-bottom: 25px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #ecf0f1;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .payment-address {
          font-family: monospace;
          background: #f8f9fa;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.9rem;
          word-break: break-all;
        }

        .currency-selection {
          margin-bottom: 25px;
        }

        .currency-selection label {
          display: block;
          margin-bottom: 15px;
          font-weight: 500;
          color: #2c3e50;
        }

        .currency-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
        }

        .currency-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          border: 2px solid #ecf0f1;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .currency-option:hover {
          border-color: rgb(17 24 39);
        }

        .currency-option.selected {
          border-color: rgb(17 24 39);
          background: #ebf3fd;
        }

        .currency-symbol {
          font-size: 1.5rem;
          margin-bottom: 5px;
        }

        .currency-name {
          font-weight: 500;
          color: #2c3e50;
          margin-bottom: 2px;
        }

        .currency-code {
          font-size: 0.8rem;
          color: #7f8c8d;
        }

        .estimated-amount {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 25px;
          text-align: center;
        }

        .estimated-amount p {
          margin: 0 0 5px 0;
          font-size: 1.1rem;
        }

        .estimated-amount small {
          color: #7f8c8d;
        }

        .payment-actions {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }

        .payment-actions .btn {
          flex: 1;
        }

        .payment-status {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .status-pending {
          color: #856404;
          font-weight: 500;
        }

        .status-note {
          margin: 10px 0 0 0;
          font-size: 0.9rem;
          color: #856404;
        }

        .success-icon,
        .expired-icon {
          text-align: center;
          margin-bottom: 20px;
        }

        .success-icon i {
          font-size: 4rem;
          color: #27ae60;
        }

        .expired-icon i {
          font-size: 4rem;
          color: #e74c3c;
        }

        .crypto-payment-success,
        .crypto-payment-expired {
          text-align: center;
        }

        .crypto-payment-success h3,
        .crypto-payment-expired h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
        }

        .crypto-payment-success p,
        .crypto-payment-expired p {
          color: #7f8c8d;
          margin-bottom: 25px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: rgb(17 24 39);
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
        }

        .btn-outline {
          background: transparent;
          color: #7f8c8d;
          border: 1px solid #bdc3c7;
        }

        .btn-outline:hover {
          background: #ecf0f1;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .gateway-info {
          margin-top: 10px;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          display: inline-block;
        }

        .gateway-info small {
          color: #6c757d;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default CryptoPayment;
