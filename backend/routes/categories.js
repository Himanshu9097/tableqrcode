const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get restaurant ID from query or headers
const getRestaurantId = (req) => {
  return req.headers['x-restaurant-id'] || req.query.restaurantId;
};

// @route   GET /api/categories
// @desc    Get categories for a restaurant
// @access  Public
router.get('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const list = await Category.find({ restaurantId: restaurantId.trim().toLowerCase() });
    res.json(list);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin)
router.post('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const { name, icon } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const total = await Category.countDocuments({ restaurantId });
    const newId = `cat_${Date.now()}_${total + 1}`;

    const newCat = new Category({
      id: newId,
      restaurantId: restaurantId.trim().toLowerCase(),
      name,
      icon: icon || 'utensils'
    });
    await newCat.save();
    res.status(201).json(newCat);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const result = await Category.findOneAndDelete({ id: req.params.id, restaurantId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    res.json({ success: true, message: "Category deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
