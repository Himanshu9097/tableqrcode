require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');

// Import models
const Restaurant = require('./models/Restaurant');
const Category = require('./models/Category');
const Food = require('./models/Food');
const Table = require('./models/Table');
const Employee = require('./models/Employee');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Settings = require('./models/Settings');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/table_qr_food');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Restaurant.deleteMany({});
    await Category.deleteMany({});
    await Food.deleteMany({});
    await Table.deleteMany({});
    await Employee.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});
    await Settings.deleteMany({});
    console.log('Cleared existing database data...');

    // 1. Seed Restaurants (Tenants)
    const restaurants = [
      { id: "swad_express", name: "Swad Express - Royal Indian", email: "admin@swad-express.com", phone: "9876543210", plan: "Pro", status: "Active" },
      { id: "tandoor_box", name: "Tandoor Box - Charcoal Grills", email: "admin@tandoor-box.com", phone: "8765432109", plan: "Starter", status: "Active" }
    ];
    await Restaurant.insertMany(restaurants);
    console.log('Seeded restaurants...');

    // 2. Seed Categories
    const categories = [
      // Swad Express
      { id: "s_cat_1", restaurantId: "swad_express", name: "Appetizers", icon: "soup" },
      { id: "s_cat_2", restaurantId: "swad_express", name: "Main Course", icon: "utensils" },
      { id: "s_cat_3", restaurantId: "swad_express", name: "Desserts", icon: "ice-cream" },
      { id: "s_cat_4", restaurantId: "swad_express", name: "Beverages", icon: "coffee" },
      // Tandoor Box
      { id: "t_cat_1", restaurantId: "tandoor_box", name: "Charcoal Grills", icon: "flame" },
      { id: "t_cat_2", restaurantId: "tandoor_box", name: "Spicy Rolls", icon: "wrap" },
      { id: "t_cat_3", restaurantId: "tandoor_box", name: "Steamed Momos", icon: "soup" },
      { id: "t_cat_4", restaurantId: "tandoor_box", name: "Coolers", icon: "glass-water" }
    ];
    await Category.insertMany(categories);
    console.log('Seeded categories...');

    // 3. Seed Foods
    const foods = [
      // Swad Express
      { id: "sf_1", restaurantId: "swad_express", categoryId: "s_cat_1", name: "Paneer Tikka Multani", price: 249.00, description: "Cottage cheese cubes marinated in rich spiced yogurt with herbs and charcoal grilled.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.8, isSpecial: true },
      { id: "sf_2", restaurantId: "swad_express", categoryId: "s_cat_1", name: "Murgh Malai Tikka", price: 299.00, description: "Boneless chicken marinated in fresh cream, cheese, cardamoms, roasted in tandoor.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80", isVeg: false, isAvailable: true, rating: 4.9, isSpecial: true },
      { id: "sf_3", restaurantId: "swad_express", categoryId: "s_cat_2", name: "Butter Chicken Bukhara", price: 399.00, description: "Tandoori grilled chicken pieces slow simmered in velvety tomato cream and cashew gravy.", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80", isVeg: false, isAvailable: true, rating: 4.9, isSpecial: true },
      { id: "sf_4", restaurantId: "swad_express", categoryId: "s_cat_2", name: "Paneer Butter Masala", price: 329.00, description: "Soft paneer cubes folded into a rich onion-tomato gravy with sweet cream and butter.", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.7, isSpecial: false },
      { id: "sf_5", restaurantId: "swad_express", categoryId: "s_cat_2", name: "Dal Makhani Bukhara", price: 279.00, description: "Whole black lentils slow cooked overnight on charcoal with butter, cream, and garlic.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.8, isSpecial: false },
      { id: "sf_6", restaurantId: "swad_express", categoryId: "s_cat_3", name: "Hot Gulab Jamun with Rabri", price: 129.00, description: "Soft warm milk dumplings soaked in cardamom sugar syrup, served with cold thickened milk.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.9, isSpecial: true },
      { id: "sf_7", restaurantId: "swad_express", categoryId: "s_cat_4", name: "Mango Lassi", price: 99.00, description: "Thick chilled yogurt beverage blended with sweet ripe Alphonso mangoes and cardamoms.", image: "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.8, isSpecial: false },
      
      // Tandoor Box
      { id: "tf_1", restaurantId: "tandoor_box", categoryId: "t_cat_1", name: "Seekh Kebab Double", price: 189.00, description: "Two flame-grilled minced mutton skewers seasoned with hot dry spices, served with fresh mint yogurt.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80", isVeg: false, isAvailable: true, rating: 4.8, isSpecial: true },
      { id: "tf_2", restaurantId: "tandoor_box", categoryId: "t_cat_1", name: "Tandoori Soya Chaap", price: 149.00, description: "Juicy soy chunks marinated in pickling tandoori spices and charred over active charcoals.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.6, isSpecial: false },
      { id: "tf_3", restaurantId: "tandoor_box", categoryId: "t_cat_2", name: "Chicken Egg Kathi Roll", price: 129.00, description: "Flaky wheat paratha layered with beaten egg, filled with spiced chicken cubes, lime juice, and red onions.", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=400&q=80", isVeg: false, isAvailable: true, rating: 4.9, isSpecial: true },
      { id: "tf_4", restaurantId: "tandoor_box", categoryId: "t_cat_2", name: "Double Paneer Tikka Roll", price: 119.00, description: "Grilled cottage cheese cubes wrapped in warm rumali roti with coriander chutney and sweet pickled onions.", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.7, isSpecial: false },
      { id: "tf_5", restaurantId: "tandoor_box", categoryId: "t_cat_3", name: "Steam Corn Cheese Momos", price: 109.00, description: "Five steamed dumplings packed with sweet corn niblets, cheddar, and processed cheese, served with hot dip.", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.5, isSpecial: false },
      { id: "tf_6", restaurantId: "tandoor_box", categoryId: "t_cat_3", name: "Fried Schezwan Chicken Momos", price: 129.00, description: "Crispy fried chicken momos tossed in spicy house Schezwan pepper oil.", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80", isVeg: false, isAvailable: true, rating: 4.8, isSpecial: true },
      { id: "tf_7", restaurantId: "tandoor_box", categoryId: "t_cat_4", name: "Masala Lemon Cooler", price: 69.00, description: "Refreshing fizzy cooler spiked with black pepper, mint leaves, and roasted cumin spices.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80", isVeg: true, isAvailable: true, rating: 4.4, isSpecial: false }
    ];
    await Food.insertMany(foods);
    console.log('Seeded food items...');

    // 4. Seed Tables
    const getSeedTables = (restId) => [
      { id: "tab_1", restaurantId: restId, name: "Table 1", status: "Available", capacity: 2 },
      { id: "tab_2", restaurantId: restId, name: "Table 2", status: "Available", capacity: 4 },
      { id: "tab_3", restaurantId: restId, name: "Table 3", status: "Available", capacity: 4 },
      { id: "tab_4", restaurantId: restId, name: "Table 4", status: "Reserved", capacity: 6 },
      { id: "tab_5", restaurantId: restId, name: "Table 5", status: "Cleaning", capacity: 2 }
    ];
    await Table.insertMany([...getSeedTables('swad_express'), ...getSeedTables('tandoor_box')]);
    console.log('Seeded tables...');

    // 5. Seed Employees
    const employees = [
      // Swad Express staff
      { id: "swad_express_emp_1", restaurantId: "swad_express", name: "Swad Admin", email: "admin@swad-express.com", password: "123456", role: "Admin", contact: "9876543210", status: "Active", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
      { id: "swad_express_emp_2", restaurantId: "swad_express", name: "Ramesh Cashier", email: "staff@swad-express.com", password: "123456", role: "Cashier", contact: "8765432109", status: "Active", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
      { id: "swad_express_emp_3", restaurantId: "swad_express", name: "Chef Suresh", email: "chef@swad-express.com", password: "123456", role: "Chef", contact: "7654321098", status: "Active", image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80" },
      // Tandoor Box staff
      { id: "tandoor_box_emp_1", restaurantId: "tandoor_box", name: "Tandoor Admin", email: "admin@tandoor-box.com", password: "123456", role: "Admin", contact: "9876543210", status: "Active", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
      { id: "tandoor_box_emp_2", restaurantId: "tandoor_box", name: "Karan Cashier", email: "staff@tandoor-box.com", password: "123456", role: "Cashier", contact: "8765432109", status: "Active", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
      { id: "tandoor_box_emp_3", restaurantId: "tandoor_box", name: "Chef Mohan", email: "chef@tandoor-box.com", password: "123456", role: "Chef", contact: "7654321098", status: "Active", image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80" }
    ];
    await Employee.insertMany(employees);
    console.log('Seeded employees...');

    // 6. Seed Settings
    const getSettings = (restId, name) => ({
      restaurantId: restId,
      restaurantName: name,
      restaurantLogo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80",
      address: `Plot 42, Sector 18, Scoped Outlet ${name}, Noida, UP, India`,
      phone: "+91 98765 43210",
      email: `dining@${restId.replace(/_/g, '-')}.com`,
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
    await Settings.insertMany([
      getSettings('swad_express', 'Swad Express - Royal Indian'),
      getSettings('tandoor_box', 'Tandoor Box - Charcoal Grills')
    ]);
    console.log('Seeded settings...');

    // 7. Seed Customers
    const initialCustomers = [
      { id: "cust_1", restaurantId: "swad_express", name: "Aarav Sharma", phone: "9876543210", ordersCount: 1, totalSpend: 273.90, favItem: "Paneer Tikka Multani" }
    ];
    await Customer.insertMany(initialCustomers);
    console.log('Seeded customers...');

    // 8. Seed Orders
    const initialOrders = [
      {
        id: "INV-1001",
        orderNo: 1,
        restaurantId: "swad_express",
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
      }
    ];
    await Order.insertMany(initialOrders);
    console.log('Seeded orders...');

    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
