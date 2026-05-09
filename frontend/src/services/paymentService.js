import axios from 'axios';

const API_BASE = '/api/payment';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Creates a Razorpay order on the backend.
 * @param {{ customerName: string, amount: number }} data
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const createOrder = async (data) => {
  const response = await api.post('/create-order', data);
  return response.data;
};

/**
 * Verifies payment signature on the backend.
 * @param {{ razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string }} data
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const verifyPayment = async (data) => {
  const response = await api.post('/verify', data);
  return response.data;
};

/**
 * Fetches payment status for a given order ID.
 * @param {string} orderId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const getPaymentStatus = async (orderId) => {
  const response = await api.get(`/status/${orderId}`);
  return response.data;
};

export default api;
