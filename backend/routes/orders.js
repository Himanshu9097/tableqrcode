const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table');
const Customer = require('../models/Customer');
const Settings = require('../models/Settings');

const getRestaurantId = (req) => {
  return req.headers['x-restaurant-id'] || req.query.restaurantId;
};

// @route   GET /api/orders
// @desc    Get all orders for a restaurant
// @access  Public
router.get('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const list = await Order.find({ restaurantId: restaurantId.trim().toLowerCase() }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create a new order ticket
// @access  Public
router.post('/', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  const { customerName, customerPhone, tableId, guestCount, items, subtotal, discount, tax, serviceCharge, grandTotal, paymentMethod, notes } = req.body;

  try {
    const restId = restaurantId.trim().toLowerCase();
    
    // Get invoice settings
    let settings = await Settings.findOne({ restaurantId: restId });
    const invoicePrefix = settings ? settings.invoicePrefix : 'INV-';

    // Calculate order numbering
    const totalOrders = await Order.countDocuments({ restaurantId: restId });
    const orderNo = totalOrders + 1;
    const orderId = `${invoicePrefix}${1000 + orderNo}`;

    // Create Order document
    const newOrder = new Order({
      id: orderId,
      orderNo,
      restaurantId: restId,
      customerName,
      customerPhone,
      tableId,
      guestCount: parseInt(guestCount) || 2,
      items,
      subtotal: parseFloat(subtotal),
      discount: parseFloat(discount || 0),
      tax: parseFloat(tax),
      serviceCharge: parseFloat(serviceCharge),
      grandTotal: parseFloat(grandTotal),
      paymentMethod,
      paymentStatus: (paymentMethod === 'Cash' || paymentMethod === 'Card') ? 'Unpaid' : 'Paid',
      status: 'Pending',
      notes: notes || '',
      preparedBy: ''
    });

    await newOrder.save();

    // 1. Mark table as Occupied
    if (tableId) {
      await Table.findOneAndUpdate({ id: tableId, restaurantId: restId }, { status: 'Occupied' });
    }

    // 2. Update Customer Loyalty profiles
    if (customerPhone) {
      let customer = await Customer.findOne({ phone: customerPhone, restaurantId: restId });
      if (customer) {
        customer.ordersCount += 1;
        customer.totalSpend = parseFloat((customer.totalSpend + parseFloat(grandTotal)).toFixed(2));

        // Recompute customer's favorite dish from order history
        const allCustOrders = await Order.find({ customerPhone, restaurantId: restId });
        const frequencies = {};
        allCustOrders.forEach(o => {
          o.items.forEach(it => {
            frequencies[it.name] = (frequencies[it.name] || 0) + it.quantity;
          });
        });

        // Add current order items as well
        items.forEach(it => {
          frequencies[it.name] = (frequencies[it.name] || 0) + it.quantity;
        });

        let fav = 'None';
        let maxQty = 0;
        for (const [name, qty] of Object.entries(frequencies)) {
          if (qty > maxQty) {
            maxQty = qty;
            fav = name;
          }
        }
        customer.favItem = fav;
        await customer.save();
      }
    }

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order preparation status
// @access  Public
router.put('/:id/status', async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const { status, preparedBy } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: "Restaurant context is required." });
  }

  try {
    const restId = restaurantId.trim().toLowerCase();
    const order = await Order.findOne({ id: req.params.id, restaurantId: restId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    order.status = status;
    if (preparedBy !== undefined) {
      order.preparedBy = preparedBy;
    }

    if (status === 'Completed') {
      order.paymentStatus = 'Paid'; // mark paid when completed
    }

    await order.save();

    // Floor release hooks: completed or cancelled releases the table
    if (status === 'Completed' || status === 'Cancelled') {
      const nextTableState = status === 'Completed' ? 'Cleaning' : 'Available';
      await Table.findOneAndUpdate({ id: order.tableId, restaurantId: restId }, { status: nextTableState });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
