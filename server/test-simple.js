console.log('Testing simple import...');

try {
  const controller = require('./controllers/userPaymentInfoController');
  console.log('Controller loaded successfully');
  console.log('Type:', typeof controller);
  console.log('Keys:', Object.keys(controller));
  console.log('getSupportedCryptocurrencies type:', typeof controller.getSupportedCryptocurrencies);
} catch (error) {
  console.log('Error loading controller:', error.message);
}
