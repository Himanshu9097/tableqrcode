const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number,
  instructions: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  orderNo: {
    type: Number,
    required: true
  },
  restaurantId: {
    type: String,
    required: true,
    index: true
  },
  customerName: String,
  customerPhone: String,
  tableId: String,
  guestCount: {
    type: Number,
    default: 2
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    required: true
  },
  serviceCharge: {
    type: Number,
    required: true
  },
  grandTotal: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'UPI'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid'
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  preparedBy: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.index({ id: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Order', orderSchema);
