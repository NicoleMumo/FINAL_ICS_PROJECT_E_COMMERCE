// mockPaymentCallback.js
const axios = require('axios');

const orderId = process.argv[2]; // Pass order ID as a command-line argument

if (!orderId) {
  console.error('Usage: node mockPaymentCallback.js <orderId>');
  process.exit(1);
}

axios.post('http://localhost:5000/api/orders/payment-callback', {
  MerchantReference: orderId,
  PaymentStatus: 'COMPLETED'
})
  .then(res => {
    console.log('Callback response:', res.data);
  })
  .catch(err => {
    console.error('Error calling payment callback:', err.response?.data || err.message);
  });