const axios = require('axios');
const crypto = require('crypto');

class CryptoPaymentService {
  constructor() {
    // Payment gateway configuration
    this.gateway = process.env.CRYPTO_GATEWAY || 'nowpayments'; // 'btcpay' or 'nowpayments'
    
    // BTCPay Server configuration
    this.btcpayUrl = process.env.BTCPAY_URL || 'https://testnet.demo.btcpayserver.org';
    this.btcpayApiKey = process.env.BTCPAY_API_KEY || '';
    this.btcpayStoreId = process.env.BTCPAY_STORE_ID || '';
    this.btcpayWebhookSecret = process.env.BTCPAY_WEBHOOK_SECRET || '';
    
    // NowPayments configuration
    this.nowpaymentsApiKey = process.env.NOWPAYMENTS_API_KEY || '';
    this.nowpaymentsBaseUrl = 'https://api.nowpayments.io/v1';
    this.nowpaymentsWebhookSecret = process.env.NOWPAYMENTS_WEBHOOK_SECRET || '';
  }

  // Create a new invoice
  async createInvoice(amount, currency, orderId, description) {
    if (this.gateway === 'btcpay') {
      return this.createBTCPayInvoice(amount, currency, orderId, description);
    } else {
      return this.createNowPaymentsInvoice(amount, currency, orderId, description);
    }
  }

  // BTCPay Server invoice creation
  async createBTCPayInvoice(amount, currency, orderId, description) {
    try {
      const invoiceData = {
        amount: amount,
        currency: currency || 'USD',
        orderId: orderId,
        itemDesc: description,
        notificationURL: `${process.env.BASE_URL || 'http://localhost:5000'}/api/membership/payments/crypto/webhook`,
        redirectURL: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
        fullNotifications: true,
        extendedNotifications: true
      };

      const response = await axios.post(
        `${this.btcpayUrl}/api/v1/stores/${this.btcpayStoreId}/invoices`,
        invoiceData,
        {
          headers: {
            'Authorization': `token ${this.btcpayApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        gateway: 'btcpay',
        invoiceId: response.data.id,
        paymentUrl: response.data.checkoutLink,
        paymentAddress: response.data.addresses?.BTC || '',
        amount: response.data.amount,
        currency: response.data.currency,
        status: response.data.status
      };
    } catch (error) {
      console.error('BTCPay invoice creation error:', error.response?.data || error.message);
      return {
        success: false,
        gateway: 'btcpay',
        error: error.response?.data?.message || error.message
      };
    }
  }

  // NowPayments invoice creation
  async createNowPaymentsInvoice(amount, currency, orderId, description) {
    try {
      const paymentData = {
        price_amount: amount,
        price_currency: currency || 'usd',
        pay_currency: 'btc', // Default to BTC, can be changed
        order_id: orderId,
        order_description: description,
        ipn_callback_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/membership/payments/crypto/webhook`,
        is_fixed_rate: true,
        is_fee_paid_by_user: false
      };

      const response = await axios.post(
        `${this.nowpaymentsBaseUrl}/payment`,
        paymentData,
        {
          headers: {
            'x-api-key': this.nowpaymentsApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        gateway: 'nowpayments',
        invoiceId: response.data.payment_id,
        paymentUrl: `https://nowpayments.io/payment/?iid=${response.data.payment_id}`,
        paymentAddress: response.data.pay_address,
        amount: response.data.price_amount,
        currency: response.data.price_currency,
        payCurrency: response.data.pay_currency,
        status: response.data.payment_status
      };
    } catch (error) {
      console.error('NowPayments invoice creation error:', error.response?.data || error.message);
      return {
        success: false,
        gateway: 'nowpayments',
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Get invoice status
  async getInvoiceStatus(invoiceId) {
    if (this.gateway === 'btcpay') {
      return this.getBTCPayInvoiceStatus(invoiceId);
    } else {
      return this.getNowPaymentsInvoiceStatus(invoiceId);
    }
  }

  // BTCPay Server invoice status
  async getBTCPayInvoiceStatus(invoiceId) {
    try {
      const response = await axios.get(
        `${this.btcpayUrl}/api/v1/stores/${this.btcpayStoreId}/invoices/${invoiceId}`,
        {
          headers: {
            'Authorization': `token ${this.btcpayApiKey}`
          }
        }
      );

      return {
        success: true,
        gateway: 'btcpay',
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
        paid: response.data.status === 'Settled'
      };
    } catch (error) {
      console.error('BTCPay get invoice error:', error.response?.data || error.message);
      return {
        success: false,
        gateway: 'btcpay',
        error: error.response?.data?.message || error.message
      };
    }
  }

  // NowPayments invoice status
  async getNowPaymentsInvoiceStatus(invoiceId) {
    try {
      const response = await axios.get(
        `${this.nowpaymentsBaseUrl}/payment/${invoiceId}`,
        {
          headers: {
            'x-api-key': this.nowpaymentsApiKey
          }
        }
      );

      const isPaid = ['confirmed', 'finished'].includes(response.data.payment_status);

      return {
        success: true,
        gateway: 'nowpayments',
        status: response.data.payment_status,
        amount: response.data.price_amount,
        currency: response.data.price_currency,
        payAmount: response.data.pay_amount,
        payCurrency: response.data.pay_currency,
        paid: isPaid
      };
    } catch (error) {
      console.error('NowPayments get invoice error:', error.response?.data || error.message);
      return {
        success: false,
        gateway: 'nowpayments',
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature, gateway = null) {
    const currentGateway = gateway || this.gateway;
    
    try {
      if (currentGateway === 'btcpay') {
        const expectedSignature = crypto
          .createHmac('sha256', this.btcpayWebhookSecret)
          .update(payload)
          .digest('hex');
        return signature === expectedSignature;
      } else {
        // NowPayments uses a different signature format
        const expectedSignature = crypto
          .createHmac('sha512', this.nowpaymentsWebhookSecret)
          .update(payload)
          .digest('hex');
        return signature === expectedSignature;
      }
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  // Process webhook
  async processWebhook(payload, signature, gateway = null) {
    const currentGateway = gateway || this.gateway;
    
    try {
      if (!this.verifyWebhookSignature(payload, signature, currentGateway)) {
        return { success: false, error: 'Invalid signature' };
      }

      const data = JSON.parse(payload);
      
      if (currentGateway === 'btcpay') {
        return this.processBTCPayWebhook(data);
      } else {
        return this.processNowPaymentsWebhook(data);
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process BTCPay webhook
  processBTCPayWebhook(data) {
    switch (data.type) {
      case 'InvoiceSettled':
        return {
          success: true,
          gateway: 'btcpay',
          event: 'payment_completed',
          invoiceId: data.invoiceId,
          amount: data.amount,
          currency: data.currency
        };
      
      case 'InvoiceExpired':
        return {
          success: true,
          gateway: 'btcpay',
          event: 'payment_expired',
          invoiceId: data.invoiceId
        };
      
      case 'InvoiceInvalid':
        return {
          success: true,
          gateway: 'btcpay',
          event: 'payment_failed',
          invoiceId: data.invoiceId,
          error: data.error
        };
      
      default:
        return {
          success: true,
          gateway: 'btcpay',
          event: 'unknown',
          data: data
        };
    }
  }

  // Process NowPayments webhook
  processNowPaymentsWebhook(data) {
    switch (data.payment_status) {
      case 'confirmed':
      case 'finished':
        return {
          success: true,
          gateway: 'nowpayments',
          event: 'payment_completed',
          invoiceId: data.payment_id,
          amount: data.price_amount,
          currency: data.price_currency,
          payAmount: data.pay_amount,
          payCurrency: data.pay_currency
        };
      
      case 'expired':
        return {
          success: true,
          gateway: 'nowpayments',
          event: 'payment_expired',
          invoiceId: data.payment_id
        };
      
      case 'failed':
        return {
          success: true,
          gateway: 'nowpayments',
          event: 'payment_failed',
          invoiceId: data.payment_id,
          error: data.failure_reason
        };
      
      default:
        return {
          success: true,
          gateway: 'nowpayments',
          event: 'payment_updated',
          invoiceId: data.payment_id,
          status: data.payment_status
        };
    }
  }

  // Get supported cryptocurrencies
  async getSupportedCurrencies() {
    if (this.gateway === 'btcpay') {
      return this.getBTCPayCurrencies();
    } else {
      return this.getNowPaymentsCurrencies();
    }
  }

  // BTCPay supported currencies
  getBTCPayCurrencies() {
    return [
      { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
      { code: 'LTC', name: 'Litecoin', symbol: 'Ł' },
      { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
      { code: 'BCH', name: 'Bitcoin Cash', symbol: '₿' },
      { code: 'XMR', name: 'Monero', symbol: 'ɱ' }
    ];
  }

  // NowPayments supported currencies
  async getNowPaymentsCurrencies() {
    try {
      const response = await axios.get(`${this.nowpaymentsBaseUrl}/currencies`, {
        headers: {
          'x-api-key': this.nowpaymentsApiKey
        }
      });

      return response.data.currencies.map(currency => ({
        code: currency.toUpperCase(),
        name: this.getCurrencyName(currency),
        symbol: this.getCurrencySymbol(currency)
      }));
    } catch (error) {
      console.error('Error fetching NowPayments currencies:', error);
      // Fallback to common currencies
      return [
        { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
        { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
        { code: 'LTC', name: 'Litecoin', symbol: 'Ł' },
        { code: 'BCH', name: 'Bitcoin Cash', symbol: '₿' },
        { code: 'XRP', name: 'Ripple', symbol: 'XRP' },
        { code: 'ADA', name: 'Cardano', symbol: '₳' },
        { code: 'DOT', name: 'Polkadot', symbol: 'DOT' },
        { code: 'LINK', name: 'Chainlink', symbol: 'LINK' }
      ];
    }
  }

  // Get currency name
  getCurrencyName(code) {
    const names = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'LTC': 'Litecoin',
      'BCH': 'Bitcoin Cash',
      'XRP': 'Ripple',
      'ADA': 'Cardano',
      'DOT': 'Polkadot',
      'LINK': 'Chainlink',
      'USDT': 'Tether',
      'USDC': 'USD Coin',
      'DAI': 'Dai',
      'UNI': 'Uniswap',
      'AAVE': 'Aave',
      'COMP': 'Compound',
      'MKR': 'Maker',
      'YFI': 'Yearn Finance'
    };
    return names[code.toUpperCase()] || code.toUpperCase();
  }

  // Get currency symbol
  getCurrencySymbol(code) {
    const symbols = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'LTC': 'Ł',
      'BCH': '₿',
      'XRP': 'XRP',
      'ADA': '₳',
      'DOT': 'DOT',
      'LINK': 'LINK',
      'USDT': '₮',
      'USDC': '$',
      'DAI': '$',
      'UNI': 'UNI',
      'AAVE': 'AAVE',
      'COMP': 'COMP',
      'MKR': 'MKR',
      'YFI': 'YFI'
    };
    return symbols[code.toUpperCase()] || code.toUpperCase();
  }

  // Convert USD to crypto (using NowPayments rates when available)
  async convertToCrypto(usdAmount, cryptoCode) {
    if (this.gateway === 'nowpayments') {
      try {
        const response = await axios.get(
          `${this.nowpaymentsBaseUrl}/estimate?amount=${usdAmount}&currency_from=usd&currency_to=${cryptoCode.toLowerCase()}`,
          {
            headers: {
              'x-api-key': this.nowpaymentsApiKey
            }
          }
        );
        return response.data.estimated_amount;
      } catch (error) {
        console.error('Error getting NowPayments rate:', error);
        // Fallback to demo rates
      }
    }
    
    // Fallback rates (demo purposes)
    const rates = {
      BTC: 45000,
      LTC: 150,
      ETH: 3000,
      BCH: 400,
      XMR: 200,
      XRP: 1.2,
      ADA: 1.5,
      DOT: 25,
      LINK: 15,
      USDT: 1,
      USDC: 1,
      DAI: 1
    };

    const rate = rates[cryptoCode.toUpperCase()] || 1;
    return usdAmount / rate;
  }

  // Get minimum payment amounts
  async getMinimumAmounts() {
    if (this.gateway === 'nowpayments') {
      try {
        const response = await axios.get(`${this.nowpaymentsBaseUrl}/min-amount/BTC`, {
          headers: {
            'x-api-key': this.nowpaymentsApiKey
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error getting minimum amounts:', error);
      }
    }
    
    // Fallback minimum amounts
    return {
      BTC: 0.0001,
      ETH: 0.001,
      LTC: 0.01,
      BCH: 0.001,
      XMR: 0.001
    };
  }
}

module.exports = new CryptoPaymentService();
