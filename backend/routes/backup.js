const express = require('express');
const router = express.Router();

// Import models
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const Food = require('../models/Food');
const Table = require('../models/Table');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

// @route   GET /api/backup/export
// @desc    Export entire MongoDB cluster databases
// @access  Private (Super Admin)
router.get('/export', async (req, res) => {
  try {
    const backup = {
      restaurants: await Restaurant.find(),
      categories: await Category.find(),
      foods: await Food.find(),
      tables: await Table.find(),
      employees: await Employee.find(),
      settings: await Settings.find(),
      customers: await Customer.find(),
      orders: await Order.find()
    };
    res.json(backup);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/backup/restore
// @desc    Restore database directories from JSON payload
// @access  Private (Super Admin)
router.post('/restore', async (req, res) => {
  const backup = req.body;

  try {
    // 1. Wipe collections
    await Restaurant.deleteMany({});
    await Category.deleteMany({});
    await Food.deleteMany({});
    await Table.deleteMany({});
    await Employee.deleteMany({});
    await Settings.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});

    // 2. Restore entries if present in JSON payload
    if (backup.restaurants) await Restaurant.insertMany(backup.restaurants);
    if (backup.categories) await Category.insertMany(backup.categories);
    if (backup.foods) await Food.insertMany(backup.foods);
    if (backup.tables) await Table.insertMany(backup.tables);
    if (backup.employees) await Employee.insertMany(backup.employees);
    if (backup.settings) await Settings.insertMany(backup.settings);
    if (backup.customers) await Customer.insertMany(backup.customers);
    if (backup.orders) await Order.insertMany(backup.orders);

    res.json({ success: true, message: "Cluster database directories restored successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
