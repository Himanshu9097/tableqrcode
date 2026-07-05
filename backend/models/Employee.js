const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    default: '123456' // Match db.js default password policy
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Cashier', 'Chef'],
    default: 'Cashier'
  },
  contact: String,
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active'
  },
  image: String
});

employeeSchema.index({ email: 1, restaurantId: 1 }, { unique: true });
employeeSchema.index({ id: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Employee', employeeSchema);
