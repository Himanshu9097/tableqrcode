const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  email: String,
  phone: String,
  plan: {
    type: String,
    enum: ['Starter', 'Pro', 'Enterprise'],
    default: 'Pro'
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
