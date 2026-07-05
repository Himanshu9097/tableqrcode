const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  restaurantId: {
    type: String,
    required: true,
    index: true
  },
  categoryId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  image: String,
  isVeg: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  isSpecial: {
    type: Boolean,
    default: false
  }
});

// Unique item within a restaurant
foodSchema.index({ id: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Food', foodSchema);
