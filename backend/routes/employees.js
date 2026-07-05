const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

const getRestaurantId = (req) => {
  return req.headers['x-restaurant-id'] || req.query.restaurantId;
};

// @route   GET /api/employees
// @desc    Get employees list
// @access  Private (Admin)
router.get('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const list = await Employee.find({ restaurantId: restaurantId.trim().toLowerCase() });
    res.json(list);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/employees
// @desc    Register a new employee
// @access  Private (Admin)
router.post('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const { name, email, role, contact, status, image, password } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const emailExists = await Employee.findOne({ email, restaurantId: restaurantId.trim().toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email is already registered under this restaurant." });
    }

    const newId = "emp_" + Date.now();
    const newEmp = new Employee({
      id: newId,
      restaurantId: restaurantId.trim().toLowerCase(),
      name,
      email,
      password: password || "123456", // custom or default credentials
      role: role || 'Cashier',
      contact,
      status: status || 'Active',
      image: image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    });

    await newEmp.save();
    res.status(201).json(newEmp);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee details
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const emp = await Employee.findOne({ id: req.params.id, restaurantId });
    if (!emp) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }

    const { name, role, contact, status, image } = req.body;
    if (name !== undefined) emp.name = name;
    if (role !== undefined) emp.role = role;
    if (contact !== undefined) emp.contact = contact;
    if (status !== undefined) emp.status = status;
    if (image !== undefined) emp.image = image;

    await emp.save();
    res.json(emp);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const result = await Employee.findOneAndDelete({ id: req.params.id, restaurantId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }
    res.json({ success: true, message: "Employee deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
