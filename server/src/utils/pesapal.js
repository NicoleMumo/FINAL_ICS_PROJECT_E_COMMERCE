const axios = require('axios');
require('dotenv').config();

const DEMO_MODE = true; // Set to true to mock Pesapal API

const PESAPAL_BASE_URL = process.env.PESAPAL_BASE_URL || 'https://pay.pesapal.com/v3/api';
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

// Get Pesapal OAuth token
async function getPesapalToken() {
  if (DEMO_MODE) {
    // Return a fake token for demo
    return 'demo-token';
  }
  const url = `${PESAPAL_BASE_URL}/Auth/RequestToken`;
  const credentials = Buffer.from(`${PESAPAL_CONSUMER_KEY}:${PESAPAL_CONSUMER_SECRET}`).toString('base64');
  const headers = {
    Authorization: `Basic ${credentials}`,
    'Content-Type': 'application/json',
  };
  const res = await axios.get(url, { headers });
  return res.data.token;
}

// Submit order request (STK Push)
async function submitPesapalOrder({
  id,
  amount,
  currency = 'KES',
  description,
  callback_url,
  phone_number,
  token,
}) {
  console.log('submitPesapalOrder called for order', id);
  if (DEMO_MODE) {
    console.log('DEMO_MODE: submitPesapalOrder called for order', id);
    // Return a fake order response for demo
    // AUTOMATE: Trigger payment callback after mock payment
    setTimeout(async () => {
      try {
        await axios.post('http://localhost:5000/api/payment-callback', {
          MerchantReference: id,
          PaymentStatus: 'COMPLETED',
        });
        console.log('Automated payment callback triggered for order', id);
      } catch (err) {
        console.error('Error triggering payment callback:', err.response?.data || err.message);
      }
    }, 2000); // Simulate delay
    return {
      order_tracking_id: 'demo-tracking-id',
      redirect_url: 'https://demo.pesapal.com/redirect',
      status: 'PENDING',
    };
  }
  const url = `${PESAPAL_BASE_URL}/Transactions/SubmitOrderRequest`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const data = {
    id: String(id),
    currency,
    amount,
    description,
    callback_url,
    billing_address: {
      phone_number,
    },
  };
  const res = await axios.post(url, data, { headers });
  return res.data;
}

module.exports = {
  getPesapalToken,
  submitPesapalOrder,
}; 