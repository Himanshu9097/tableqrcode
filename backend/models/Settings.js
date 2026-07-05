const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  restaurantName: String,
  restaurantLogo: String,
  address: String,
  phone: String,
  email: String,
  currency: {
    type: String,
    default: '₹'
  },
  currencyCode: {
    type: String,
    default: 'INR'
  },
  taxRate: {
    type: Number,
    default: 5
  },
  serviceChargeRate: {
    type: Number,
    default: 5
  },
  openTime: {
    type: String,
    default: '11:00'
  },
  closeTime: {
    type: String,
    default: '23:00'
  },
  theme: {
    type: String,
    default: 'dark'
  },
  invoicePrefix: {
    type: String,
    default: 'INV-'
  },
  invoiceFooter: String
});

module.exports = mongoose.model('Settings', settingsSchema);
