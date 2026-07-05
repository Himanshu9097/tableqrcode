const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const Food = require('../models/Food');
const Table = require('../models/Table');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

// @route   GET /api/restaurants
// @desc    Get all restaurants
// @access  Public (Used by super admin and landing page)
router.get('/', async (req, res) => {
  try {
    const list = await Restaurant.find().sort({ registeredAt: -1 });
    const result = [];
    
    for (let rest of list) {
      const orders = await Order.find({ restaurantId: rest.id, status: 'Completed' });
      const salesVol = orders.reduce((sum, o) => sum + o.grandTotal, 0);
      result.push({
        ...rest.toObject(),
        salesVolume: salesVol,
        ordersCount: orders.length
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/restaurants
// @desc    Register a new restaurant tenant and initialize defaults
// @access  Public
router.post('/', async (req, res) => {
  const { id, name, email, phone, plan, logo, password } = req.body;

  try {
    // 1. Validation
    const exists = await Restaurant.findOne({ id: id.trim().toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Subdomain slug already taken." });
    }

    // 2. Create Restaurant
    const newRest = new Restaurant({
      id: id.trim().toLowerCase(),
      name,
      email,
      phone,
      plan: plan || 'Pro',
      status: 'Active'
    });
    await newRest.save();

    const restId = newRest.id;
    const slug = restId.replace(/_/g, '-');

    // 3. Initialize default structures for the restaurant (mirroring DB.js `initRestaurant`)
    // Category Seeds
    const cats = [
      { id: "s_cat_1", restaurantId: restId, name: "Appetizers", icon: "soup" },
      { id: "s_cat_2", restaurantId: restId, name: "Main Course", icon: "utensils" },
      { id: "s_cat_3", restaurantId: restId, name: "Desserts", icon: "ice-cream" },
      { id: "s_cat_4", restaurantId: restId, name: "Beverages", icon: "coffee" }
    ];
    await Category.insertMany(cats);

    // Food Seeds
    const foods = [
      { id: "sf_1", restaurantId: restId, categoryId: "s_cat_1", name: "Paneer Tikka Multani", price: 249.00, description: "Cottage cheese cubes marinated in rich spiced yogurt with herbs and charcoal grilled.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.8, isSpecial: true },
      { id: "sf_2", restaurantId: restId, categoryId: "s_cat_1", name: "Murgh Malai Tikka", price: 299.00, description: "Boneless chicken marinated in fresh cream, cheese, cardamoms, roasted in tandoor.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80", isVeg: false, isAvailable: true, rating: 4.9, isSpecial: true },
      { id: "sf_3", restaurantId: restId, categoryId: "s_cat_2", name: "Butter Chicken Bukhara", price: 399.00, description: "Tandoori grilled chicken pieces slow simmered in velvety tomato cream and cashew gravy.", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80", isVeg: false, isAvailable: true, rating: 4.9, isSpecial: true },
      { id: "sf_4", restaurantId: restId, categoryId: "s_cat_2", name: "Paneer Butter Masala", price: 329.00, description: "Soft paneer cubes folded into a rich onion-tomato gravy with sweet cream and butter.", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.7, isSpecial: false },
      { id: "sf_5", restaurantId: restId, categoryId: "s_cat_2", name: "Dal Makhani Bukhara", price: 279.00, description: "Whole black lentils slow cooked overnight on charcoal with butter, cream, and garlic.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.8, isSpecial: false },
      { id: "sf_6", restaurantId: restId, categoryId: "s_cat_3", name: "Hot Gulab Jamun with Rabri", price: 129.00, description: "Soft warm milk dumplings soaked in cardamom sugar syrup, served with cold thickened milk.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.9, isSpecial: true },
      { id: "sf_7", restaurantId: restId, categoryId: "s_cat_4", name: "Mango Lassi", price: 99.00, description: "Thick chilled yogurt beverage blended with sweet ripe Alphonso mangoes and cardamoms.", image: "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.8, isSpecial: false }
    ];
    await Food.insertMany(foods);

    // Table Seeds
    const tables = [
      { id: "tab_1", restaurantId: restId, name: "Table 1", status: "Available", capacity: 2 },
      { id: "tab_2", restaurantId: restId, name: "Table 2", status: "Available", capacity: 4 },
      { id: "tab_3", restaurantId: restId, name: "Table 3", status: "Available", capacity: 4 },
      { id: "tab_4", restaurantId: restId, name: "Table 4", status: "Reserved", capacity: 6 },
      { id: "tab_5", restaurantId: restId, name: "Table 5", status: "Cleaning", capacity: 2 }
    ];
    await Table.insertMany(tables);

    // Employee Seeds
    const emps = [
      { id: `${restId}_emp_1`, restaurantId: restId, name: `${name} Admin`, email: `admin@${slug}.com`, password: password || "123456", role: "Admin", contact: phone || "9876543210", status: "Active", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
      { id: `${restId}_emp_2`, restaurantId: restId, name: "Ramesh Cashier", email: `staff@${slug}.com`, password: "123456", role: "Cashier", contact: "8765432109", status: "Active", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
      { id: `${restId}_emp_3`, restaurantId: restId, name: "Chef Suresh", email: `chef@${slug}.com`, password: "123456", role: "Chef", contact: "7654321098", status: "Active", image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80" }
    ];
    await Employee.insertMany(emps);

    // Settings Seeds
    const settings = new Settings({
      restaurantId: restId,
      restaurantName: name,
      restaurantLogo: logo || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80",
      address: `Plot 42, Sector 18, Scoped Outlet ${name}, Noida, UP, India`,
      phone: phone || "+91 98765 43210",
      email: `dining@${slug}.com`,
      currency: "₹",
      currencyCode: "INR",
      taxRate: 5,
      serviceChargeRate: 5,
      openTime: "11:00",
      closeTime: "23:00",
      theme: "dark",
      invoicePrefix: "INV-",
      invoiceFooter: `Dhanyavaad! Thank you for dining at ${name}.`
    });
    await settings.save();

    // Customer Seeds
    const custs = [
      { id: "cust_1", restaurantId: restId, name: "Aarav Sharma", phone: "9876543210", ordersCount: 1, totalSpend: 273.90, favItem: "Paneer Tikka Multani" }
    ];
    await Customer.insertMany(custs);

    // Order Seeds
    const initialOrder = new Order({
      id: "INV-1001",
      orderNo: 1,
      restaurantId: restId,
      customerName: "Aarav Sharma",
      customerPhone: "9876543210",
      tableId: "tab_3",
      guestCount: 2,
      items: [{ id: "sf_1", name: "Paneer Tikka Multani", price: 249.00, quantity: 1, instructions: "Mild spicy" }],
      subtotal: 249.00,
      discount: 0,
      tax: 12.45,
      serviceCharge: 12.45,
      grandTotal: 273.90,
      paymentMethod: "UPI QR",
      paymentStatus: "Paid",
      status: "Completed",
      notes: "None",
      preparedBy: "Chef Suresh",
      createdAt: new Date()
    });
    await initialOrder.save();

    res.status(201).json({ success: true, restaurant: newRest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/restaurants/:id/status
// @desc    Update restaurant active status (Suspend/Reactivate)
// @access  Private (Super Admin)
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;

  try {
    const rest = await Restaurant.findOne({ id: req.params.id });
    if (!rest) {
      return res.status(404).json({ success: false, message: "Restaurant not found." });
    }

    rest.status = status;
    await rest.save();

    res.json({ success: true, message: `Status updated to ${status}.`, restaurant: rest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
