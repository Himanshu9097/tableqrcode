const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Reserved', 'Cleaning'],
    default: 'Available'
  },
  capacity: {
    type: Number,
    default: 4
  }
});

tableSchema.index({ id: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
