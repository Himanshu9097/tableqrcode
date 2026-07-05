const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

const getRestaurantId = (req) => {
  return req.headers['x-restaurant-id'] || req.query.restaurantId;
};

// @route   GET /api/customers
// @desc    Get loyalty customers for a restaurant
// @access  Public
router.get('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const list = await Customer.find({ restaurantId: restaurantId.trim().toLowerCase() });
    res.json(list);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/customers/find-or-create
// @desc    Find or create a customer by phone
// @access  Public
router.post('/find-or-create', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const { name, phone } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    let customer = await Customer.findOne({ phone, restaurantId });
    if (!customer) {
      customer = new Customer({
        id: "cust_" + Date.now(),
        restaurantId: restaurantId.trim().toLowerCase(),
        name,
        phone,
        ordersCount: 0,
        totalSpend: 0,
        favItem: "None"
      });
      await customer.save();
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
