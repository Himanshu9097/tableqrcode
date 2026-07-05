const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// @route   POST /api/auth/login
// @desc    Authenticate employee / super admin
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password, isSuperAdmin, restaurantId } = req.body;

  try {
    // 1. Super Admin Authorization
    if (isSuperAdmin) {
      if (email === "super@quickqr.io" && password === "123456") {
        const superUser = { 
          id: "super_admin", 
          name: "QuickQR Super Admin", 
          email: "super@quickqr.io", 
          role: "SuperAdmin", 
          restaurantId: "super",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
        };
        return res.json({ success: true, user: superUser });
      }
      return res.status(401).json({ success: false, message: "Invalid Super Admin credentials." });
    }

    // 2. Multi-Tenant Restaurant Employee Authorization
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: "Restaurant context is required." });
    }

    // Look for employee in specific tenant
    const employee = await Employee.findOne({ email, restaurantId });
    if (!employee) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (employee.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials (use password 123456)." });
    }

    if (employee.status !== "Active") {
      return res.status(403).json({ success: false, message: "Account suspended." });
    }

    res.json({ success: true, user: {
      id: employee.id,
      restaurantId: employee.restaurantId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      contact: employee.contact,
      image: employee.image
    }});

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
