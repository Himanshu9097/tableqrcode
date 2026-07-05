const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

const getRestaurantId = (req) => {
  return req.headers['x-restaurant-id'] || req.query.restaurantId;
};

// @route   GET /api/foods
// @desc    Get food items for a restaurant
// @access  Public
router.get('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const list = await Food.find({ restaurantId: restaurantId.trim().toLowerCase() });
    res.json(list);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/foods
// @desc    Add a new food item
// @access  Private (Admin)
router.post('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const { categoryId, name, price, description, image, isVeg, isAvailable, rating, isSpecial } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const newId = "food_" + (Date.now() + Math.floor(Math.random() * 1000));
    const newFood = new Food({
      id: newId,
      restaurantId: restaurantId.trim().toLowerCase(),
      categoryId,
      name,
      price: parseFloat(price),
      description,
      image: image || "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80",
      isVeg: isVeg === undefined ? true : isVeg,
      isAvailable: isAvailable === undefined ? true : isAvailable,
      rating: rating || 4.5,
      isSpecial: isSpecial === undefined ? false : isSpecial
    });
    await newFood.save();
    res.status(201).json(newFood);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/foods/:id
// @desc    Update a food item
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const food = await Food.findOne({ id: req.params.id, restaurantId });
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found." });
    }

    const { categoryId, name, price, description, image, isVeg, isAvailable, rating, isSpecial } = req.body;
    if (categoryId !== undefined) food.categoryId = categoryId;
    if (name !== undefined) food.name = name;
    if (price !== undefined) food.price = parseFloat(price);
    if (description !== undefined) food.description = description;
    if (image !== undefined) food.image = image;
    if (isVeg !== undefined) food.isVeg = isVeg;
    if (isAvailable !== undefined) food.isAvailable = isAvailable;
    if (rating !== undefined) food.rating = rating;
    if (isSpecial !== undefined) food.isSpecial = isSpecial;

    await food.save();
    res.json(food);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/foods/:id
// @desc    Delete a food item
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const result = await Food.findOneAndDelete({ id: req.params.id, restaurantId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Food item not found." });
    }
    res.json({ success: true, message: "Food item deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
