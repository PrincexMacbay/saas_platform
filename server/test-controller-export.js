const userPaymentInfoController = require('./controllers/userPaymentInfoController');

console.log('Controller object:', userPaymentInfoController);
console.log('Type of controller:', typeof userPaymentInfoController);
console.log('Available functions:');
console.log('- getUserPaymentInfo:', typeof userPaymentInfoController.getUserPaymentInfo);
console.log('- upsertUserPaymentInfo:', typeof userPaymentInfoController.upsertUserPaymentInfo);
console.log('- deleteUserPaymentInfo:', typeof userPaymentInfoController.deleteUserPaymentInfo);
console.log('- getSupportedCryptocurrencies:', typeof userPaymentInfoController.getSupportedCryptocurrencies);
console.log('- testPaymentGateway:', typeof userPaymentInfoController.testPaymentGateway);
console.log('- getAllPaymentInfo:', typeof userPaymentInfoController.getAllPaymentInfo);
