import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useMembershipData } from '../../contexts/MembershipDataContext';

const PaymentInfo = () => {
  const { user } = useAuth();
  const { data, loading: contextLoading, refreshData } = useMembershipData();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [cryptocurrencies, setCryptocurrencies] = useState([]);
  const [testResult, setTestResult] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    accountType: 'checking',
    preferredCrypto: 'BTC',
    btcAddress: '',
    ethAddress: '',
    ltcAddress: '',
    bchAddress: '',
    xmrAddress: '',
    paymentGateway: 'nowpayments',
    gatewayApiKey: '',
    gatewayStoreId: '',
    isActive: true,
    autoAcceptPayments: true,
    minimumPaymentAmount: 0.01,
    paymentInstructions: '',
    taxId: '',
    businessName: ''
  });

  useEffect(() => {
    // Use preloaded data if available
    if (data.paymentInfo) {
      console.log('🚀 PaymentInfo: Using preloaded data');
      setPaymentInfo(data.paymentInfo);
      setLoading(false);
      // Populate form with existing data
      if (data.paymentInfo) {
        setFormData({
          bankName: data.paymentInfo.bankName || '',
          accountNumber: data.paymentInfo.accountNumber || '',
          routingNumber: data.paymentInfo.routingNumber || '',
          accountHolderName: data.paymentInfo.accountHolderName || '',
          accountType: data.paymentInfo.accountType || 'checking',
          preferredCrypto: data.paymentInfo.preferredCrypto || 'BTC',
          btcAddress: data.paymentInfo.btcAddress || '',
          ethAddress: data.paymentInfo.ethAddress || '',
          ltcAddress: data.paymentInfo.ltcAddress || '',
          bchAddress: data.paymentInfo.bchAddress || '',
          xmrAddress: data.paymentInfo.xmrAddress || '',
          paymentGateway: data.paymentInfo.paymentGateway || 'nowpayments',
          gatewayApiKey: data.paymentInfo.gatewayApiKey || '',
          gatewaySecretKey: data.paymentInfo.gatewaySecretKey || '',
          gatewayWebhookSecret: data.paymentInfo.gatewayWebhookSecret || '',
          gatewaySandboxMode: data.paymentInfo.gatewaySandboxMode || false
        });
      }
    } else if (!contextLoading.paymentInfo) {
      console.log('🚀 PaymentInfo: Fetching data (not preloaded)');
      loadPaymentInfo();
    }
    loadCryptocurrencies();
  }, [data.paymentInfo, contextLoading.paymentInfo]);

  const loadPaymentInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user-payment-info/my-payment-info');
      if (response.data.success) {
        setPaymentInfo(response.data.data);
        // Populate form with existing data
        if (response.data.data) {
          setFormData({
            bankName: response.data.data.bankName || '',
            accountNumber: response.data.data.accountNumber || '',
            routingNumber: response.data.data.routingNumber || '',
            accountHolderName: response.data.data.accountHolderName || '',
            accountType: response.data.data.accountType || 'checking',
            preferredCrypto: response.data.data.preferredCrypto || 'BTC',
            btcAddress: response.data.data.btcAddress || '',
            ethAddress: response.data.data.ethAddress || '',
            ltcAddress: response.data.data.ltcAddress || '',
            bchAddress: response.data.data.bchAddress || '',
            xmrAddress: response.data.data.xmrAddress || '',
            paymentGateway: response.data.data.paymentGateway || 'nowpayments',
            gatewayApiKey: response.data.data.gatewayApiKey || '',
            gatewayStoreId: response.data.data.gatewayStoreId || '',
            isActive: response.data.data.isActive !== false,
            autoAcceptPayments: response.data.data.autoAcceptPayments !== false,
            minimumPaymentAmount: response.data.data.minimumPaymentAmount || 0.01,
            paymentInstructions: response.data.data.paymentInstructions || '',
            taxId: response.data.data.taxId || '',
            businessName: response.data.data.businessName || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading payment info:', error);
      if (error.response?.status !== 404) {
        showMessage('Failed to load payment information', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCryptocurrencies = async () => {
    try {
      const response = await api.get('/user-payment-info/cryptocurrencies');
      if (response.data.success) {
        setCryptocurrencies(response.data.data);
      }
    } catch (error) {
      console.error('Error loading cryptocurrencies:', error);
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
    setSaving(true);
    setMessage('');

    try {
      const response = await api.post('/user-payment-info/my-payment-info', formData);
      if (response.data.success) {
        setPaymentInfo(response.data.data);
        showMessage(response.data.message, 'success');
      }
    } catch (error) {
      console.error('Error saving payment info:', error);
      showMessage(error.response?.data?.message || 'Failed to save payment information', 'error');
    } finally {
      setSaving(false);
    }
  };

  const testGateway = async () => {
    setTesting(true);
    setTestResult(null);
    setMessage('');

    try {
      const response = await api.post('/user-payment-info/test-gateway', {
        paymentGateway: formData.paymentGateway,
        gatewayApiKey: formData.gatewayApiKey,
        gatewayStoreId: formData.gatewayStoreId
      });
      
      setTestResult(response.data);
      if (response.data.success) {
        showMessage(response.data.message, 'success');
      } else {
        showMessage(response.data.message, 'error');
      }
    } catch (error) {
      console.error('Error testing gateway:', error);
      showMessage('Failed to test payment gateway', 'error');
    } finally {
      setTesting(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const getCryptoAddressField = (crypto) => {
    const fieldMap = {
      'BTC': 'btcAddress',
      'ETH': 'ethAddress',
      'LTC': 'ltcAddress',
      'BCH': 'bchAddress',
      'XMR': 'xmrAddress'
    };
    return fieldMap[crypto] || 'btcAddress';
  };

  // Only show loading if no data is available at all
  if (!paymentInfo && loading && !data.paymentInfo) {
    return (
      <div className="payment-info-loading">
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-info-container">
      {/* <div className="payment-info-header">
        <h2>
          <i className="fas fa-credit-card"></i>
          Payment Information
        </h2>
        <p>Configure your payment details to receive payments from other users</p>
      </div> */}

      {message && (
        <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-info-form">
        <div className="payment-info-layout">
          {/* Left Column - Bank & Business Info */}
          <div className="payment-info-column">
            {/* Bank Information Section */}
            <div className="form-section">
              <h3>
                <i className="fas fa-university"></i>
                Bank Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="bankName">Bank Name</label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter bank name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="accountNumber">Account Number</label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter account number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="routingNumber">Routing Number</label>
                  <input
                    type="text"
                    id="routingNumber"
                    name="routingNumber"
                    value={formData.routingNumber}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter routing number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="accountHolderName">Account Holder Name</label>
                  <input
                    type="text"
                    id="accountHolderName"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter account holder name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="accountType">Account Type</label>
                  <select
                    id="accountType"
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="form-section">
              <h3>
                <i className="fas fa-building"></i>
                Business Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="businessName">Business Name (Optional)</label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter business name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="taxId">Tax ID (Optional)</label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter tax ID"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Crypto & Gateway */}
          <div className="payment-info-column">
            {/* Blockchain Information Section */}
            <div className="form-section">
              <h3>
                <i className="fas fa-link"></i>
                Cryptocurrency Information
              </h3>
              <div className="form-group">
                <label htmlFor="preferredCrypto">Preferred Cryptocurrency</label>
                <select
                  id="preferredCrypto"
                  name="preferredCrypto"
                  value={formData.preferredCrypto}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  {cryptocurrencies.map(crypto => (
                    <option key={crypto.code} value={crypto.code}>
                      {crypto.name} ({crypto.symbol})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Crypto Address Fields */}
              <div className="crypto-addresses">
                {['BTC', 'ETH', 'LTC', 'BCH', 'XMR'].map(crypto => (
                  <div key={crypto} className="form-group">
                    <label htmlFor={getCryptoAddressField(crypto)}>
                      {crypto} Address
                      {formData.preferredCrypto === crypto && (
                        <span className="badge badge-primary ml-2">Preferred</span>
                      )}
                    </label>
                    <input
                      type="text"
                      id={getCryptoAddressField(crypto)}
                      name={getCryptoAddressField(crypto)}
                      value={formData[getCryptoAddressField(crypto)]}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder={`Enter ${crypto} address`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Gateway Section */}
            <div className="form-section">
              <h3>
                <i className="fas fa-cogs"></i>
                Payment Gateway Settings
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="paymentGateway">Payment Gateway</label>
                  <select
                    id="paymentGateway"
                    name="paymentGateway"
                    value={formData.paymentGateway}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="nowpayments">NowPayments (Free)</option>
                    <option value="btcpay">BTCPay Server</option>
                    <option value="manual">Manual (No Gateway)</option>
                  </select>
                  <small className="form-text text-muted">
                    NowPayments is free and supports 50+ cryptocurrencies
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="gatewayApiKey">API Key</label>
                  <input
                    type="password"
                    id="gatewayApiKey"
                    name="gatewayApiKey"
                    value={formData.gatewayApiKey}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter API key"
                  />
                  <small className="form-text text-muted">
                    Required for {formData.paymentGateway === 'btcpay' ? 'BTCPay' : 'NowPayments'}
                  </small>
                </div>
                {formData.paymentGateway === 'btcpay' && (
                  <div className="form-group">
                    <label htmlFor="gatewayStoreId">Store ID</label>
                    <input
                      type="text"
                      id="gatewayStoreId"
                      name="gatewayStoreId"
                      value={formData.gatewayStoreId}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Enter store ID"
                    />
                  </div>
                )}
              </div>

              <div className="gateway-test-section">
                <button
                  type="button"
                  onClick={testGateway}
                  disabled={testing || !formData.gatewayApiKey}
                  className="btn btn-outline-primary"
                >
                  {testing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Testing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plug"></i>
                      Test Connection
                    </>
                  )}
                </button>

                {testResult && (
                  <div className={`alert alert-${testResult.success ? 'success' : 'danger'} mt-3`}>
                    <strong>{testResult.success ? 'Success!' : 'Error!'}</strong> {testResult.message}
                    {testResult.supportedCurrencies && (
                      <div className="mt-2">
                        <small>Supported currencies: {testResult.supportedCurrencies}</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Section - Payment Preferences */}
        <div className="form-section payment-preferences-section">
          <h3>
            <i className="fas fa-sliders-h"></i>
            Payment Preferences
          </h3>
          <div className="preferences-grid">
            <div className="form-group">
              <label htmlFor="minimumPaymentAmount">Minimum Payment Amount</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  id="minimumPaymentAmount"
                  name="minimumPaymentAmount"
                  value={formData.minimumPaymentAmount}
                  onChange={handleInputChange}
                  className="form-control"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div className="form-group">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="form-check-input"
                />
                <label htmlFor="isActive" className="form-check-label">
                  Accept payments
                </label>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="paymentInstructions">Payment Instructions</label>
            <textarea
              id="paymentInstructions"
              name="paymentInstructions"
              value={formData.paymentInstructions}
              onChange={handleInputChange}
              className="form-control"
              rows="3"
              placeholder="Any special instructions for payers..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Payment Information
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .payment-info-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .payment-info-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .payment-info-header h2 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .payment-info-header p {
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        /* Desktop Layout */
        .payment-info-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .payment-info-column {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .form-section {
          background: white;
          border: 1px solid #ecf0f1;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .form-section h3 {
          color: #2c3e50;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #ecf0f1;
          font-size: 1.1rem;
        }

        .form-section h3 i {
          margin-right: 10px;
          color: #3498db;
        }

        /* Form Grid Layout */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .crypto-addresses {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 15px;
        }

        .gateway-test-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
        }

        /* Payment Preferences Section */
        .payment-preferences-section {
          grid-column: 1 / -1;
          margin-top: 20px;
        }

        .preferences-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          display: block;
        }

        .form-control {
          border: 1px solid #dce4ec;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
          transition: border-color 0.3s ease;
          width: 100%;
        }

        .form-control:focus {
          border-color: #3498db;
          box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
          outline: none;
        }

        .form-text {
          font-size: 12px;
          color: #7f8c8d;
          margin-top: 5px;
        }

        .badge {
          font-size: 10px;
          padding: 4px 8px;
          background: #3498db;
          color: white;
          border-radius: 4px;
        }

        .form-check {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-check-input {
          margin: 0;
        }

        .form-check-label {
          margin: 0;
          font-weight: 500;
        }

        .input-group {
          display: flex;
          align-items: center;
        }

        .input-group-text {
          background: #f8f9fa;
          border: 1px solid #dce4ec;
          border-right: none;
          padding: 10px 12px;
          border-radius: 6px 0 0 6px;
          color: #6c757d;
        }

        .input-group .form-control {
          border-radius: 0 6px 6px 0;
        }

        .form-actions {
          text-align: center;
          padding: 30px 0;
          border-top: 1px solid #ecf0f1;
          margin-top: 30px;
        }

        .btn {
          padding: 12px 30px;
          font-size: 16px;
          border-radius: 6px;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .btn-primary {
          background: #3498db;
          border-color: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
          border-color: #2980b9;
        }

        .btn-outline-primary {
          color: #3498db;
          border-color: #3498db;
          background: transparent;
        }

        .btn-outline-primary:hover {
          background: #3498db;
          color: white;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert {
          border-radius: 6px;
          padding: 15px 20px;
          margin-bottom: 20px;
        }

        .alert-success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }

        .alert-danger {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }

        .loading-spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
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

        .payment-info-loading {
          text-align: center;
          padding: 60px 20px;
        }

        .payment-info-loading p {
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .payment-info-container {
            padding: 15px;
          }

          .payment-info-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .preferences-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .form-section {
            padding: 20px;
          }

          .form-section h3 {
            font-size: 1rem;
          }

          .btn {
            padding: 10px 20px;
            font-size: 14px;
          }
        }

        /* Tablet Responsive */
        @media (max-width: 1024px) and (min-width: 769px) {
          .payment-info-layout {
            gap: 25px;
          }

          .form-section {
            padding: 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentInfo;
