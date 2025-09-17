# User Payment Information Feature

## Overview

The User Payment Information feature allows users to configure their payment details to receive payments from other users. This includes bank account information, blockchain addresses, and payment gateway settings. The feature integrates with free crypto payment gateways like NowPayments and BTCPay Server.

## Features

### 🏦 Bank Information Management
- **Bank Name**: Store the name of the user's bank
- **Account Number**: Secure storage of account numbers
- **Routing Number**: Bank routing information
- **Account Holder Name**: Name on the account
- **Account Type**: Checking, Savings, or Business account

### 🔗 Blockchain Information
- **Preferred Cryptocurrency**: Set default crypto for payments
- **Multiple Crypto Addresses**: Support for BTC, ETH, LTC, BCH, XMR
- **Address Validation**: Secure storage of blockchain addresses

### ⚙️ Payment Gateway Integration
- **NowPayments (Free)**: Free gateway supporting 50+ cryptocurrencies
- **BTCPay Server**: Self-hosted Bitcoin payment processor
- **Manual Mode**: No gateway integration for manual processing
- **API Key Management**: Secure storage of gateway credentials
- **Connection Testing**: Test gateway connectivity before saving

### 💰 Payment Preferences
- **Minimum Payment Amount**: Set minimum acceptable payment
- **Auto-Accept Payments**: Automatically accept incoming payments
- **Payment Instructions**: Custom instructions for payers
- **Business Information**: Optional business name and tax ID
- **Active Status**: Enable/disable payment acceptance

## Technical Implementation

### Backend Components

#### 1. Database Model (`UserPaymentInfo`)
```javascript
// Key fields for payment information
{
  userId: INTEGER,           // Foreign key to users table
  bankName: VARCHAR(255),    // Bank name
  accountNumber: VARCHAR(50), // Account number
  routingNumber: VARCHAR(20), // Routing number
  preferredCrypto: VARCHAR(20), // Preferred cryptocurrency
  btcAddress: VARCHAR(255),  // Bitcoin address
  ethAddress: VARCHAR(255),  // Ethereum address
  paymentGateway: ENUM,      // Payment gateway type
  gatewayApiKey: VARCHAR(255), // API key for gateway
  isActive: BOOLEAN,         // Payment acceptance status
  minimumPaymentAmount: DECIMAL // Minimum payment amount
}
```

#### 2. API Endpoints
```javascript
// User endpoints
GET    /api/user-payment-info/my-payment-info     // Get user's payment info
POST   /api/user-payment-info/my-payment-info     // Create/update payment info
DELETE /api/user-payment-info/my-payment-info     // Delete payment info
POST   /api/user-payment-info/test-gateway        // Test gateway connection

// Public endpoints
GET    /api/user-payment-info/cryptocurrencies    // Get supported cryptocurrencies

// Admin endpoints
GET    /api/user-payment-info/admin/all           // Get all payment info
GET    /api/user-payment-info/admin/:userId       // Get specific user's info
PUT    /api/user-payment-info/admin/:userId       // Update user's info
DELETE /api/user-payment-info/admin/:userId       // Delete user's info
```

#### 3. Controller Functions
- `getUserPaymentInfo`: Retrieve user's payment information
- `upsertUserPaymentInfo`: Create or update payment information
- `deleteUserPaymentInfo`: Remove payment information
- `getSupportedCryptocurrencies`: Get available cryptocurrencies
- `testPaymentGateway`: Test gateway connectivity
- `getAllPaymentInfo`: Admin function to view all users

### Frontend Components

#### 1. PaymentInfo Component
- **Form Sections**: Organized into logical groups
- **Real-time Validation**: Form validation and error handling
- **Gateway Testing**: Test payment gateway connections
- **Responsive Design**: Mobile-friendly interface

#### 2. Integration with Membership Page
- **New Tab**: Added "Payment Info" tab to membership page
- **Navigation**: Seamless integration with existing membership system
- **Consistent UI**: Matches existing design patterns

## Free Crypto Payment Gateway: NowPayments

### Why NowPayments?
- **Free to Use**: No monthly fees or setup costs
- **Wide Support**: 50+ cryptocurrencies supported
- **Easy Integration**: Simple API with comprehensive documentation
- **Global Reach**: Available worldwide
- **Instant Settlements**: Fast payment processing

### Setup Process
1. **Register Account**: Sign up at [nowpayments.io](https://nowpayments.io)
2. **Get API Key**: Generate API key from dashboard
3. **Configure Settings**: Set preferred cryptocurrencies
4. **Test Connection**: Use built-in test function
5. **Start Receiving**: Begin accepting crypto payments

### Supported Cryptocurrencies
- **Major Coins**: Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC)
- **Altcoins**: Bitcoin Cash (BCH), Monero (XMR), Ripple (XRP)
- **DeFi Tokens**: Uniswap (UNI), Aave (AAVE), Compound (COMP)
- **Stablecoins**: USDT, USDC, DAI

## Security Features

### Data Protection
- **Encrypted Storage**: Sensitive data encrypted at rest
- **Access Control**: Users can only access their own information
- **Admin Oversight**: Administrators can manage all user data
- **Audit Trail**: Complete history of changes

### API Security
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for users and admins
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: Protection against abuse

## Database Schema

### Table Structure
```sql
CREATE TABLE user_payment_info (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "bankName" VARCHAR(255),
  "accountNumber" VARCHAR(50),
  "routingNumber" VARCHAR(20),
  "accountHolderName" VARCHAR(255),
  "accountType" VARCHAR(20) CHECK ("accountType" IN ('checking', 'savings', 'business')),
  "preferredCrypto" VARCHAR(20) DEFAULT 'BTC',
  "btcAddress" VARCHAR(255),
  "ethAddress" VARCHAR(255),
  "ltcAddress" VARCHAR(255),
  "bchAddress" VARCHAR(255),
  "xmrAddress" VARCHAR(255),
  "paymentGateway" VARCHAR(20) NOT NULL DEFAULT 'nowpayments',
  "gatewayApiKey" VARCHAR(255),
  "gatewayStoreId" VARCHAR(100),
  "isActive" BOOLEAN DEFAULT true,
  "autoAcceptPayments" BOOLEAN DEFAULT true,
  "minimumPaymentAmount" DECIMAL(10,2) DEFAULT 0.01,
  "paymentInstructions" TEXT,
  "taxId" VARCHAR(50),
  "businessName" VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
- `idx_user_payment_info_user_id`: Fast user lookups
- `idx_user_payment_info_gateway`: Gateway-specific queries
- `idx_user_payment_info_active`: Active payment info filtering

## Usage Workflow

### 1. User Setup
```
User navigates to Membership → Payment Info
↓
Fills out bank information (optional)
↓
Adds blockchain addresses
↓
Selects payment gateway (NowPayments recommended)
↓
Enters API key and tests connection
↓
Sets payment preferences
↓
Saves configuration
```

### 2. Receiving Payments
```
Another user wants to pay
↓
System checks recipient's payment info
↓
Validates minimum amount and active status
↓
Creates payment invoice via gateway
↓
Processes payment automatically
↓
Updates payment records
↓
Sends confirmation notifications
```

### 3. Admin Management
```
Admin accesses admin panel
↓
Views all user payment configurations
↓
Monitors payment gateway status
↓
Manages user payment settings
↓
Generates reports and analytics
```

## Configuration Options

### Environment Variables
```bash
# NowPayments Configuration
NOWPAYMENTS_API_KEY=your_api_key_here
NOWPAYMENTS_WEBHOOK_SECRET=your_webhook_secret

# BTCPay Configuration
BTCPAY_URL=https://your-btcpay-server.com
BTCPAY_API_KEY=your_api_key_here
BTCPAY_STORE_ID=your_store_id

# General Settings
CRYPTO_GATEWAY=nowpayments  # Default gateway
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Payment Gateway Settings
- **NowPayments**: Free, easy setup, wide crypto support
- **BTCPay**: Self-hosted, Bitcoin-focused, privacy-oriented
- **Manual**: No automation, manual payment processing

## Benefits

### For Users
- **Multiple Payment Methods**: Bank transfers and cryptocurrencies
- **Free Gateway**: No additional costs for crypto payments
- **Easy Setup**: Simple configuration process
- **Secure Storage**: Encrypted payment information
- **Flexible Options**: Customizable payment preferences

### For Platform
- **Revenue Generation**: Enable user-to-user payments
- **Enhanced Features**: Comprehensive payment ecosystem
- **Competitive Advantage**: Advanced payment capabilities
- **Scalability**: Support for multiple payment methods

## Future Enhancements

### Planned Features
- **Multi-currency Support**: Fiat currency payments
- **Payment Analytics**: Detailed payment statistics
- **Automated Reconciliation**: Automatic payment matching
- **Mobile App Integration**: Native mobile payment support
- **Webhook Notifications**: Real-time payment updates

### Integration Possibilities
- **Stripe Integration**: Credit card payment processing
- **PayPal Integration**: PayPal payment support
- **Bank Transfer APIs**: Automated bank transfers
- **Tax Reporting**: Automated tax documentation
- **Compliance Tools**: KYC/AML integration

## Troubleshooting

### Common Issues
1. **Gateway Connection Failed**: Check API key and network connectivity
2. **Payment Not Received**: Verify minimum amount and active status
3. **Crypto Address Invalid**: Ensure correct address format
4. **Bank Details Missing**: Complete required bank information

### Support Resources
- **API Documentation**: Comprehensive endpoint documentation
- **Error Logs**: Detailed error tracking and logging
- **Admin Panel**: Centralized management interface
- **User Guide**: Step-by-step setup instructions

## Conclusion

The User Payment Information feature provides a comprehensive solution for users to receive payments through multiple channels. With free crypto payment gateway integration, secure data storage, and intuitive user interface, it enables seamless payment processing while maintaining security and compliance standards.

The integration with NowPayments offers a cost-effective solution for cryptocurrency payments, while the flexible architecture allows for future expansion to additional payment methods and gateways.
