const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

const getRestaurantId = (req) => {
  return req.headers['x-restaurant-id'] || req.query.restaurantId;
};

// @route   GET /api/settings
// @desc    Get settings for a restaurant
// @access  Public
router.get('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    let settings = await Settings.findOne({ restaurantId: restaurantId.trim().toLowerCase() });
    if (!settings) {
      // Default fallback
      settings = new Settings({
        restaurantId: restaurantId.trim().toLowerCase(),
        restaurantName: "QuickQR Outlet",
        restaurantLogo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80",
        address: "Store Address, Noida, India",
        phone: "+91 98765 43210",
        email: "store@quickqr.io",
        currency: "₹",
        currencyCode: "INR",
        taxRate: 5,
        serviceChargeRate: 5,
        openTime: "11:00",
        closeTime: "23:00",
        theme: "dark",
        invoicePrefix: "INV-",
        invoiceFooter: "Dhanyavaad! Thank you for dining with us."
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/settings
// @desc    Create / Update settings
// @access  Private (Admin)
router.post('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const { restaurantName, restaurantLogo, address, phone, email, currency, currencyCode, taxRate, serviceChargeRate, openTime, closeTime, theme, invoicePrefix, invoiceFooter } = req.body;
    
    let settings = await Settings.findOne({ restaurantId });
    if (!settings) {
      settings = new Settings({ restaurantId });
    }

    if (restaurantName !== undefined) settings.restaurantName = restaurantName;
    if (restaurantLogo !== undefined) settings.restaurantLogo = restaurantLogo;
    if (address !== undefined) settings.address = address;
    if (phone !== undefined) settings.phone = phone;
    if (email !== undefined) settings.email = email;
    if (currency !== undefined) settings.currency = currency;
    if (currencyCode !== undefined) settings.currencyCode = currencyCode;
    if (taxRate !== undefined) settings.taxRate = parseFloat(taxRate);
    if (serviceChargeRate !== undefined) settings.serviceChargeRate = parseFloat(serviceChargeRate);
    if (openTime !== undefined) settings.openTime = openTime;
    if (closeTime !== undefined) settings.closeTime = closeTime;
    if (theme !== undefined) settings.theme = theme;
    if (invoicePrefix !== undefined) settings.invoicePrefix = invoicePrefix;
    if (invoiceFooter !== undefined) settings.invoiceFooter = invoiceFooter;

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
