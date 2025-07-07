const axios = require('axios');
require('dotenv').config();

const PESAPAL_BASE_URL = process.env.PESAPAL_BASE_URL || 'https://pay.pesapal.com/v3/api';
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

// Get Pesapal OAuth token
async function getPesapalToken() {
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