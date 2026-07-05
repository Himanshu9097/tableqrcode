const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  restaurantId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  ordersCount: {
    type: Number,
    default: 0
  },
  totalSpend: {
    type: Number,
    default: 0
  },
  favItem: {
    type: String,
    default: 'None'
  }
});

customerSchema.index({ phone: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
