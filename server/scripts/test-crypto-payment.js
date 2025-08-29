const cryptoPaymentService = require('../services/cryptoPaymentService');

async function testCryptoPayment() {
  console.log('🧪 Testing Crypto Payment Service...\n');

  // Test 1: Check gateway configuration
  console.log('1. Gateway Configuration:');
  console.log(`   Active Gateway: ${cryptoPaymentService.gateway}`);
  console.log(`   BTCPay URL: ${cryptoPaymentService.btcpayUrl}`);
  console.log(`   NowPayments Base URL: ${cryptoPaymentService.nowpaymentsBaseUrl}`);
  console.log('');

  // Test 2: Get supported currencies
  console.log('2. Supported Currencies:');
  try {
    const currencies = await cryptoPaymentService.getSupportedCurrencies();
    console.log(`   Found ${currencies.length} currencies:`);
    currencies.slice(0, 5).forEach(currency => {
      console.log(`   - ${currency.code} (${currency.name}) ${currency.symbol}`);
    });
    if (currencies.length > 5) {
      console.log(`   ... and ${currencies.length - 5} more`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 3: Test currency conversion
  console.log('3. Currency Conversion (USD to BTC):');
  try {
    const btcAmount = await cryptoPaymentService.convertToCrypto(100, 'BTC');
    console.log(`   $100 USD = ${btcAmount} BTC`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 4: Test minimum amounts
  console.log('4. Minimum Payment Amounts:');
  try {
    const minAmounts = await cryptoPaymentService.getMinimumAmounts();
    console.log('   Minimum amounts:');
    Object.entries(minAmounts).slice(0, 5).forEach(([currency, amount]) => {
      console.log(`   - ${currency}: ${amount}`);
    });
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 5: Test invoice creation (mock)
  console.log('5. Invoice Creation Test:');
  try {
    const testInvoice = await cryptoPaymentService.createInvoice(
      10.00, // $10
      'USD',
      'test-order-123',
      'Test membership payment'
    );
    
    if (testInvoice.success) {
      console.log(`   ✅ Invoice created successfully`);
      console.log(`   Gateway: ${testInvoice.gateway}`);
      console.log(`   Invoice ID: ${testInvoice.invoiceId}`);
      console.log(`   Amount: ${testInvoice.amount} ${testInvoice.currency}`);
      console.log(`   Payment URL: ${testInvoice.paymentUrl}`);
      
      // Test 6: Test invoice status check
      console.log('\n6. Invoice Status Check:');
      const status = await cryptoPaymentService.getInvoiceStatus(testInvoice.invoiceId);
      if (status.success) {
        console.log(`   ✅ Status check successful`);
        console.log(`   Status: ${status.status}`);
        console.log(`   Paid: ${status.paid}`);
      } else {
        console.log(`   ❌ Status check failed: ${status.error}`);
      }
    } else {
      console.log(`   ❌ Invoice creation failed: ${testInvoice.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 7: Test webhook signature verification
  console.log('7. Webhook Signature Verification:');
  const testPayload = JSON.stringify({ test: 'data' });
  const testSignature = 'test-signature';
  
  const btcpayVerification = cryptoPaymentService.verifyWebhookSignature(
    testPayload, 
    testSignature, 
    'btcpay'
  );
  const nowpaymentsVerification = cryptoPaymentService.verifyWebhookSignature(
    testPayload, 
    testSignature, 
    'nowpayments'
  );
  
  console.log(`   BTCPay verification: ${btcpayVerification ? '✅' : '❌'}`);
  console.log(`   NowPayments verification: ${nowpaymentsVerification ? '✅' : '❌'}`);
  console.log('');

  console.log('🏁 Crypto Payment Service Test Complete!');
}

// Run the test
testCryptoPayment().catch(console.error);

