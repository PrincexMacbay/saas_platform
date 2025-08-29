# Crypto Payment Gateway Setup Guide

This guide explains how to set up both BTCPay Server and NowPayments crypto payment gateways for your SaaS platform.

## Overview

The system now supports two crypto payment gateways:
- **BTCPay Server**: Self-hosted, privacy-focused, no fees
- **NowPayments**: Hosted service, easy setup, supports 50+ cryptocurrencies

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Payment Gateway Selection
CRYPTO_GATEWAY=nowpayments  # 'btcpay' or 'nowpayments'

# BTCPay Server Configuration (if using BTCPay)
BTCPAY_URL=https://your-btcpay-server.com
BTCPAY_API_KEY=your_btcpay_api_key
BTCPAY_STORE_ID=your_btcpay_store_id
BTCPAY_WEBHOOK_SECRET=your_btcpay_webhook_secret

# NowPayments Configuration (if using NowPayments)
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_WEBHOOK_SECRET=your_nowpayments_webhook_secret

# General Configuration
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## NowPayments Setup (Recommended for Easy Start)

### Step 1: Create NowPayments Account
1. Visit [NowPayments.io](https://nowpayments.io)
2. Click "Get Started" and create an account
3. Complete KYC verification (required for production)

### Step 2: Get API Key
1. Log into your NowPayments dashboard
2. Go to **API Keys** section
3. Generate a new API key
4. Copy the API key to your `.env` file

### Step 3: Configure Webhook
1. In NowPayments dashboard, go to **IPN Settings**
2. Set IPN URL to: `https://your-domain.com/api/membership/payments/crypto/webhook`
3. Generate a webhook secret
4. Copy the secret to your `.env` file

### Step 4: Test Integration
1. Set `CRYPTO_GATEWAY=nowpayments` in your `.env`
2. Restart your server
3. Test a payment in your application

## BTCPay Server Setup (Advanced)

### Step 1: Deploy BTCPay Server

**Option A: BTCPay Server Foundation**
1. Visit [BTCPayServer.org](https://btcpayserver.org)
2. Choose a hosting provider
3. Follow their deployment guide

**Option B: Self-hosted (Docker)**
```bash
git clone https://github.com/btcpayserver/btcpayserver-docker
cd btcpayserver-docker
./btcpay-setup.sh
```

### Step 2: Create Store
1. Access your BTCPay Server instance
2. Click "Create a new store"
3. Configure store settings:
   - Store name: Your SaaS Platform
   - Default currency: USD
   - Network: Mainnet (or Testnet for testing)
4. Note the store ID from the URL

### Step 3: Generate API Key
1. Go to **Account Settings** → **API Keys**
2. Click "Create a new API key"
3. Set permissions:
   - ✅ `btcpay.store.canmodifystoresettings`
   - ✅ `btcpay.store.canviewstoresettings`
   - ✅ `btcpay.store.canmodifyinvoices`
   - ✅ `btcpay.store.canviewinvoices`
   - ✅ `btcpay.store.canmodifypaymentrequests`
   - ✅ `btcpay.store.canviewpaymentrequests`
4. Copy the API key

### Step 4: Configure Webhook
1. In store settings, go to **Webhooks**
2. Click "Add webhook"
3. Set URL: `https://your-domain.com/api/membership/payments/crypto/webhook`
4. Select all invoice events
5. Copy the webhook secret

### Step 5: Update Environment
```env
CRYPTO_GATEWAY=btcpay
BTCPAY_URL=https://your-btcpay-server.com
BTCPAY_API_KEY=your_api_key
BTCPAY_STORE_ID=your_store_id
BTCPAY_WEBHOOK_SECRET=your_webhook_secret
```

## Supported Cryptocurrencies

### NowPayments (50+ currencies)
- Bitcoin (BTC)
- Ethereum (ETH)
- Litecoin (LTC)
- Bitcoin Cash (BCH)
- Ripple (XRP)
- Cardano (ADA)
- Polkadot (DOT)
- Chainlink (LINK)
- And many more...

### BTCPay Server
- Bitcoin (BTC)
- Litecoin (LTC)
- Ethereum (ETH)
- Bitcoin Cash (BCH)
- Monero (XMR)

## Payment Flow

1. **User selects crypto payment** in membership form
2. **System creates invoice** via selected gateway
3. **User gets payment address/QR code**
4. **User sends cryptocurrency** to the address
5. **Gateway confirms payment** via webhook
6. **System updates payment status** and creates subscription

## Testing

### Test Mode
Both gateways support test networks:
- **NowPayments**: Use test API keys
- **BTCPay Server**: Use testnet configuration

### Test Payments
1. Use small amounts (e.g., $1)
2. Use test cryptocurrencies if available
3. Monitor webhook logs for debugging

## Troubleshooting

### Common Issues

**Webhook not receiving**
- Check webhook URL is accessible
- Verify webhook secret is correct
- Check server logs for errors

**Payment not confirming**
- Verify cryptocurrency network confirmations
- Check payment address is correct
- Monitor gateway status pages

**API errors**
- Verify API keys are correct
- Check API rate limits
- Ensure proper permissions

### Debug Mode
Enable debug logging in your application:
```javascript
// In cryptoPaymentService.js
console.log('Payment gateway:', this.gateway);
console.log('API response:', response.data);
```

## Security Considerations

1. **Keep API keys secure** - Never commit to version control
2. **Use HTTPS** - Always use HTTPS in production
3. **Verify webhooks** - Always verify webhook signatures
4. **Monitor transactions** - Regularly check payment status
5. **Backup configuration** - Keep secure backups of API keys

## Cost Comparison

### NowPayments
- **Setup**: Free
- **Transaction fees**: 0.5% per transaction
- **Minimum amount**: $1
- **Support**: Email, chat

### BTCPay Server
- **Setup**: Free (self-hosted) or hosting costs
- **Transaction fees**: 0% (no fees)
- **Minimum amount**: Network minimum
- **Support**: Community, documentation

## Migration Between Gateways

To switch between gateways:

1. Update `CRYPTO_GATEWAY` in `.env`
2. Restart your server
3. Test with a small payment
4. Update webhook URLs in gateway dashboard

## Production Checklist

- [ ] API keys configured
- [ ] Webhooks set up and tested
- [ ] HTTPS enabled
- [ ] Error handling implemented
- [ ] Payment monitoring in place
- [ ] Backup procedures documented
- [ ] Support contact information available

## Support

- **NowPayments**: [support@nowpayments.io](mailto:support@nowpayments.io)
- **BTCPay Server**: [Community forum](https://chat.btcpayserver.org/)
- **Application Issues**: Check server logs and webhook responses

