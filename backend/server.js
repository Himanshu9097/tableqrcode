require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes Mount
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/restaurants', require('./routes/restaurants.js'));
app.use('/api/categories', require('./routes/categories.js'));
app.use('/api/foods', require('./routes/foods.js'));
app.use('/api/tables', require('./routes/tables.js'));
app.use('/api/employees', require('./routes/employees.js'));
app.use('/api/customers', require('./routes/customers.js'));
app.use('/api/orders', require('./routes/orders.js'));
app.use('/api/settings', require('./routes/settings.js'));
app.use('/api/backup', require('./routes/backup.js'));

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'Online', timestamp: new Date() });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
