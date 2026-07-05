const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

const getRestaurantId = (req) => {
  return req.headers['x-restaurant-id'] || req.query.restaurantId;
};

// @route   GET /api/tables
// @desc    Get tables for a restaurant
// @access  Public
router.get('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const list = await Table.find({ restaurantId: restaurantId.trim().toLowerCase() }).sort({ id: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tables
// @desc    Add a table
// @access  Private (Admin)
router.post('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const { name, capacity } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const total = await Table.countDocuments({ restaurantId });
    const newId = `tab_${total + 1}`;

    const newTable = new Table({
      id: newId,
      restaurantId: restaurantId.trim().toLowerCase(),
      name: name || `Table ${total + 1}`,
      status: 'Available',
      capacity: parseInt(capacity) || 4
    });
    await newTable.save();
    res.status(201).json(newTable);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tables/:id/status
// @desc    Update a table's status
// @access  Public
router.put('/:id/status', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const { status } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const table = await Table.findOne({ id: req.params.id, restaurantId });
    if (!table) {
      return res.status(404).json({ success: false, message: "Table not found." });
    }

    table.status = status;
    await table.save();
    res.json(table);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tables/:id
// @desc    Delete a table
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const result = await Table.findOneAndDelete({ id: req.params.id, restaurantId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Table not found." });
    }
    res.json({ success: true, message: "Table deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
