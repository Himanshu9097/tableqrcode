import axios from 'axios';

const api = axios.create({
  baseURL: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001/api'
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject restaurant tenant scoping header
api.interceptors.request.use((config) => {
  // Try query parameter 'restaurant' first
  const urlParams = new URLSearchParams(window.location.search);
  let restaurantId = urlParams.get('restaurant');

  // Try query parameter 'restaurantId' next
  if (!restaurantId) {
    restaurantId = urlParams.get('restaurantId');
  }

  // Try local session next
  if (!restaurantId) {
    const session = JSON.parse(localStorage.getItem('qr_rest_session'));
    if (session && session.restaurantId) {
      restaurantId = session.restaurantId;
    }
  }

  if (restaurantId) {
    config.headers['x-restaurant-id'] = restaurantId.trim().toLowerCase();
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
