const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
  icon: {
    type: String,
    default: 'utensils'
  }
});

// Compound unique key to allow same category ID (e.g. cat_1) across different restaurants
categorySchema.index({ id: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
