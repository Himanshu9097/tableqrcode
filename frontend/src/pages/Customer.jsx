import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  MapPin, ChevronDown, Search, Moon, Sun, 
  Zap, CheckCircle, Timer, ShoppingBag, 
  ChevronRight, X, ShoppingBasket, Plus, 
  Minus, CreditCard, Banknote, QrCode, Check, 
  Printer, ArrowLeftCircle, Truck, AlertCircle
} from 'lucide-react';

export default function Customer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Scoped context
  const [restaurantId, setRestaurantId] = useState('swad_express');
  const [settings, setSettings] = useState({ restaurantName: 'Swad Express', currency: '₹', taxRate: 5, serviceChargeRate: 5 });
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [tables, setTables] = useState([]);

  // States
  const [currentTable, setCurrentTable] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [vegFilter, setVegFilter] = useState(null); // 'veg', 'nonveg', or null
  const [searchQuery, setSearchQuery] = useState('');

  // Cart
  const [cart, setCart] = useState([]);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [paymentChannel, setPaymentChannel] = useState('UPI');
  const [notes, setNotes] = useState('');

  // Modals
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({ title: '', desc: '', success: false });

  // Live Tracking state
  const [activeOrder, setActiveOrder] = useState(null);
  const [trackingTime, setTrackingTime] = useState('00:00');
  const [trackingInterval, setTrackingInterval] = useState(null);
  const [trackerStartTime, setTrackerStartTime] = useState(null);

  useEffect(() => {
    const rest = searchParams.get('restaurant') || 'swad_express';
    setRestaurantId(rest);
    
    // Auto populate checkout fields from localStorage
    const savedName = localStorage.getItem('last_customer_name');
    const savedPhone = localStorage.getItem('last_customer_phone');
    if (savedName) setCustName(savedName);
    if (savedPhone) setCustPhone(savedPhone);

    document.documentElement.classList.add('dark');
    loadRestaurantData(rest);
  }, [searchParams]);

  const loadRestaurantData = async (restId) => {
    try {
      const [settingsRes, catsRes, foodsRes, tablesRes] = await Promise.all([
        api.get(`/settings?restaurantId=${restId}`),
        api.get(`/categories?restaurantId=${restId}`),
        api.get(`/foods?restaurantId=${restId}`),
        api.get(`/tables?restaurantId=${restId}`)
      ]);

      setSettings(settingsRes.data);
      setCategories(catsRes.data);
      setFoods(foodsRes.data);
      setTables(tablesRes.data);

      // Detect Table parameter
      const tableVal = searchParams.get('table');
      if (tableVal) {
        const fullId = tableVal.startsWith('tab_') ? tableVal : `tab_${tableVal}`;
        const found = tablesRes.data.find(t => t.id === fullId);
        if (found) {
          setCurrentTable(found);
        } else {
          setIsTableModalOpen(true);
        }
      } else {
        setIsTableModalOpen(true);
      }

      // Check suspension
      const tenantsRes = await api.get('/restaurants');
      const tenant = tenantsRes.data.find(t => t.id === restId);
      if (tenant && tenant.status === 'Suspended') {
        document.body.innerHTML = `
          <div class="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div class="p-4 bg-rose-500/10 text-rose-500 rounded-3xl border border-rose-500/20">
              <svg xmlns="http://www.w3.org/2050/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-bounce"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h1 class="text-3xl font-black text-white">DIGITAL ORDERING SUSPENDED</h1>
            <p class="text-slate-400 text-sm max-w-md leading-relaxed font-semibold">
              The digital ordering portal for <span class="text-rose-400 font-extrabold">${tenant.name}</span> has been temporarily suspended by administration.
            </p>
          </div>
        `;
      }
    } catch (err) {
      showToast('Error initializing menu network', 'error');
    }
  };

  // Poll active order state during tracking
  useEffect(() => {
    let trackingPoll = null;
    if (activeOrder) {
      trackingPoll = setInterval(async () => {
        try {
          const res = await api.get(`/orders?restaurantId=${restaurantId}`);
          const updated = res.data.find(o => o.id === activeOrder.id);
          if (updated) {
            setActiveOrder(updated);
            if (updated.status === 'Completed' || updated.status === 'Cancelled') {
              clearInterval(trackingPoll);
              if (trackingInterval) clearInterval(trackingInterval);
            }
          }
        } catch (err) {
          console.warn('Tracker state poll failed', err);
        }
      }, 5000);
    }
    return () => {
      if (trackingPoll) clearInterval(trackingPoll);
    };
  }, [activeOrder, trackingInterval]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  };

  const confirmTableSelection = (tableId) => {
    const found = tables.find(t => t.id === tableId);
    if (found) {
      setCurrentTable(found);
      setIsTableModalOpen(false);
      showToast(`Dining at Table ${found.id.replace('tab_', '')}`);
      // Push state
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('table', found.id.replace('tab_', ''));
      window.history.pushState({}, '', newUrl);
    }
  };

  // Cart operations
  const addToCart = (food) => {
    const existing = cart.find(it => it.id === food.id);
    if (existing) {
      setCart(cart.map(it => it.id === food.id ? { ...it, quantity: it.quantity + 1 } : it));
    } else {
      setCart([...cart, { id: food.id, name: food.name, price: food.price, quantity: 1, instructions: '' }]);
    }
    showToast(`Added ${food.name}`);
  };

  const changeQuantity = (foodId, delta) => {
    setCart(cart.map(it => {
      if (it.id === foodId) {
        const qty = it.quantity + delta;
        return qty > 0 ? { ...it, quantity: qty } : null;
      }
      return it;
    }).filter(Boolean));
  };

  const updateItemInstructions = (foodId, text) => {
    setCart(cart.map(it => it.id === foodId ? { ...it, instructions: text } : it));
  };

  // Totals calculations
  const subtotal = cart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const cgst = parseFloat(((subtotal * (settings.taxRate / 2)) / 100).toFixed(2));
  const sgst = parseFloat(((subtotal * (settings.taxRate / 2)) / 100).toFixed(2));
  const totalTax = cgst + sgst;
  const serviceCharge = parseFloat(((subtotal * settings.serviceChargeRate) / 100).toFixed(2));
  const grandTotal = parseFloat((subtotal + totalTax + serviceCharge).toFixed(2));

  // Submit Order Checkout
  const handleCheckoutSubmit = async () => {
    if (!currentTable) {
      showToast('Please select a table first', 'error');
      setIsTableModalOpen(true);
      return;
    }
    if (cart.length === 0) {
      showToast('Basket is empty', 'error');
      return;
    }
    if (!custName) {
      showToast('Please enter your name', 'error');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(custPhone)) {
      showToast('Please enter valid 10-digit mobile number', 'error');
      return;
    }

    // Save visitor credentials for auto fill next time
    localStorage.setItem('last_customer_name', custName);
    localStorage.setItem('last_customer_phone', custPhone);

    setIsCartDrawerOpen(false);

    if (paymentChannel === 'UPI') {
      setIsUpiModalOpen(true);
      // Simulate UPI scanner payment (4 seconds)
      setTimeout(() => {
        setIsUpiModalOpen(false);
        simulatePaymentGateway();
      }, 4000);
    } else {
      simulatePaymentGateway();
    }
  };

  const simulatePaymentGateway = () => {
    setIsProcessingPayment(true);
    setPaymentStatus({
      title: paymentChannel === 'UPI' ? 'Verifying UPI Transaction' : 'Placing Cooking Ticket',
      desc: 'Connecting to kitchen network...',
      success: false
    });

    setTimeout(() => {
      setPaymentStatus({
        title: 'Order Placed!',
        desc: 'Launching live preparation tracker...',
        success: true
      });

      setTimeout(async () => {
        setIsProcessingPayment(false);
        await finalizeCheckoutOrder();
      }, 1200);

    }, 2000);
  };

  const finalizeCheckoutOrder = async () => {
    const payload = {
      customerName: custName,
      customerPhone: custPhone,
      tableId: currentTable.id,
      guestCount,
      items: cart,
      subtotal,
      discount: 0,
      tax: totalTax,
      serviceCharge,
      grandTotal,
      paymentMethod: paymentChannel,
      notes
    };

    try {
      // 1. Create Order
      const res = await api.post(`/orders?restaurantId=${restaurantId}`, payload);
      const newOrderObj = res.data;
      setActiveOrder(newOrderObj);

      // 2. Start elapsed timer countdown
      const startTime = Date.now();
      setTrackerStartTime(startTime);
      if (trackingInterval) clearInterval(trackingInterval);

      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        setTrackingTime(`${mins}:${secs}`);
      }, 1000);
      setTrackingInterval(timer);

    } catch (err) {
      showToast('Checkout placement error', 'error');
    }
  };

  const returnToMenuFromTracking = () => {
    if (trackingInterval) clearInterval(trackingInterval);
    setCart([]);
    setActiveOrder(null);
    setNotes('');
  };

  // Filter foods
  const filteredFoods = foods.filter(f => {
    if (!f.isAvailable) return false;
    if (selectedCategory && f.categoryId !== selectedCategory) return false;
    if (vegFilter === 'veg' && !f.isVeg) return false;
    if (vegFilter === 'nonveg' && f.isVeg) return false;
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const cartTotalItems = cart.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-300 font-sans">
      
      {/* Toast notifications */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-55 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg border border-white/10 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-blinkit-green'} text-white animate-slide-up print-hide`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Responsive Container */}
      <div className="max-w-7xl mx-auto min-h-screen flex flex-col justify-between pb-24 relative bg-white dark:bg-slate-900 shadow-md">
        
        {/* ==================== ACTIVE VIEW: MENU SCREEN ==================== */}
        {!activeOrder ? (
          <div className="flex-1 flex flex-col">
            
            {/* Blinkit Yellow Header */}
            <header className="bg-blinkit-yellow text-slate-900 sticky top-0 z-30 shadow-md px-4 sm:px-6 py-4">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Brand Info & Table Selector */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsTableModalOpen(true)}>
                    <div className="p-2.5 bg-slate-900 text-blinkit-yellow rounded-2xl shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-left leading-tight">
                      <h1 className="text-xs font-black tracking-widest text-slate-700 uppercase">{settings.restaurantName}</h1>
                      <h2 className="text-base font-black tracking-tight flex items-center gap-1">
                        <span>{currentTable ? `Table: ${currentTable.id.replace('tab_', '')}` : 'Table: Not Selected'}</span>
                        <ChevronDown className="w-4 h-4 text-slate-650 inline" />
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Search Bar & Theme */}
                <div className="flex items-center gap-3 flex-1 max-w-xl w-full">
                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Search className="w-4.5 h-4.5" />
                    </span>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search paneer, lassi, rice..."
                      className="w-full pl-10 pr-10 py-3 bg-white border-none rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blinkit-green shadow-sm text-slate-800 placeholder-slate-400" 
                    />
                    <button onClick={toggleTheme} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800">
                      {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

              </div>
            </header>

            {/* Main Menu Body */}
            <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-8">
              
              {/* Quick Info Strip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl text-xs font-bold text-blinkit-green shadow-xs">
                <span className="flex items-center gap-1.5"><Zap className="w-4.5 h-4.5 fill-current" /> Express Table Cooking (10-15 Mins)</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4.5 h-4.5" /> 100% Fresh & Authentic Ingredients</span>
              </div>

              {/* Shop by Category */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Shop by Category</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map(cat => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={`flex flex-col items-center gap-1 group flex-shrink-0`}
                      >
                        <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-blinkit-green bg-blinkit-green/10 scale-105 shadow-xs' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                          <span className="text-xl text-blinkit-green">🍽️</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-blinkit-green">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Veg / Non-Veg Filtering slider */}
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/60 p-2 rounded-2xl max-w-sm">
                <button 
                  onClick={() => setVegFilter(vegFilter === 'veg' ? null : 'veg')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 ${vegFilter === 'veg' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm border border-emerald-600 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span></span>
                  <span>Pure Veg</span>
                </button>
                <button 
                  onClick={() => setVegFilter(vegFilter === 'nonveg' ? null : 'nonveg')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 ${vegFilter === 'nonveg' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm border border-rose-600 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span></span>
                  <span>Non-Veg</span>
                </button>
              </div>

              {/* Food items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredFoods.map(food => {
                  const inCartItem = cart.find(it => it.id === food.id);
                  return (
                    <div 
                      key={food.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-3 flex flex-col justify-between space-y-3 relative hover:shadow-md transition-all group"
                    >
                      <div className="h-28 w-full rounded-2xl overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                        <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 z-10 w-4 h-4 rounded bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs">
                          <span className={`w-2.5 h-2.5 rounded-sm border ${food.isVeg ? 'border-emerald-650' : 'border-rose-650'} flex items-center justify-center`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-emerald-600' : 'bg-rose-605'}`}></span>
                          </span>
                        </span>
                        <span className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-lg bg-slate-950/70 text-white font-black text-[8px] flex items-center gap-0.5">
                          <Timer className="w-2.5 h-2.5" />
                          <span>12 MINS</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">{food.name}</h4>
                        <p className="text-[9px] text-slate-400 font-bold">1 Plate</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/40">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100">{settings.currency}{food.price.toFixed(0)}</span>
                        
                        <div className="w-20">
                          {inCartItem ? (
                            <div className="bg-blinkit-green text-white font-bold rounded-xl flex items-center justify-between w-full h-8 px-1 text-xs select-none">
                              <button onClick={() => changeQuantity(food.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-emerald-700 rounded">-</button>
                              <span>{inCartItem.quantity}</span>
                              <button onClick={() => changeQuantity(food.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-emerald-700 rounded">+</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => addToCart(food)}
                              className="w-full h-8 border border-blinkit-green hover:bg-blinkit-green/10 text-blinkit-green font-black rounded-xl text-xs uppercase tracking-wider transition-all select-none"
                            >
                              ADD
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </main>

            {/* STICKY BOTTOM CHECKOUT TRIGGER */}
            {cartTotalItems > 0 && (
              <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 transition-all px-4 py-3 shadow-lg print-hide">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-blinkit-green/10 text-blinkit-green rounded-xl">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="text-left leading-none">
                      <h4 className="text-sm font-black">{settings.currency}{grandTotal.toFixed(0)}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">{cartTotalItems} Portion(s) Added</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsCartDrawerOpen(true)}
                    className="px-6 py-3 bg-blinkit-green hover:bg-emerald-700 text-white font-black rounded-2xl text-xs flex items-center gap-1 active:scale-95 transition-all shadow-md"
                  >
                    <span>View Basket</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          // ==================== ACTIVE VIEW: LIVE ORDER TRACKING STATE ====================
          <div className="flex-1 flex flex-col p-6 max-w-2xl mx-auto w-full space-y-6">
            
            {/* Stepper Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blinkit-green/10 rounded-full flex items-center justify-center text-blinkit-green mx-auto">
                <Truck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black">Live Order Tracker</h2>
              <p className="text-xs text-slate-400">Order ID: <span className="font-extrabold text-slate-800 dark:text-slate-200">#{activeOrder.id}</span></p>
            </div>

            {/* Live timer counter */}
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-[32px] text-center space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Elapsed Since Placed</p>
              <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100">{trackingTime}</h3>
              <p className="text-xs text-blinkit-green font-bold mt-1">
                Dining at Table {currentTable ? currentTable.id.replace('tab_', '') : ''}
              </p>
            </div>

            {/* Vertical Progress Stepper */}
            <div className="relative pl-8 space-y-8 py-2 max-w-sm mx-auto w-full">
              {/* Vertical Line */}
              <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800">
                <div 
                  className="w-full bg-blinkit-green transition-all duration-1000"
                  style={{
                    height: 
                      activeOrder.status === 'Pending' ? '0%' :
                      activeOrder.status === 'Preparing' ? '50%' :
                      activeOrder.status === 'Ready' ? '75%' :
                      activeOrder.status === 'Completed' ? '100%' : '25%'
                  }}
                ></div>
              </div>

              {[
                { key: 'Pending', title: 'Order Placed', desc: 'Kitchen has received your ticket details' },
                { key: 'Confirmed', title: 'Order Confirmed', desc: 'Preparing ingredients in the kitchen' },
                { key: 'Preparing', title: 'Cooking in Progress', desc: activeOrder.preparedBy ? `Chef ${activeOrder.preparedBy} is preparing your hot dishes` : 'Ingredients are simmered/grilled now' },
                { key: 'Ready', title: 'Food Ready to Serve', desc: 'Waiter is bringing hot plates to your table' },
                { key: 'Completed', title: 'Order Delivered', desc: 'Served at table. Enjoy your meal!' }
              ].map((step, idx) => {
                const orderStates = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'];
                const activeIndex = orderStates.indexOf(activeOrder.status === 'Cancelled' ? 'Completed' : activeOrder.status);
                const isDone = idx <= activeIndex;

                return (
                  <div key={step.key} className="relative flex gap-4 items-start">
                    <span className={`absolute left-[-29px] w-6 h-6 rounded-full border-2 bg-white dark:bg-slate-900 flex items-center justify-center z-10 transition-all ${isDone ? 'border-blinkit-green text-blinkit-green' : 'border-slate-200 text-slate-400'}`}>
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-2 h-2 rounded-full bg-slate-200"></span>}
                    </span>
                    <div className="leading-tight">
                      <h4 className={`font-extrabold text-sm ${isDone ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>{step.title}</h4>
                      <p className="text-[10px] text-slate-405 dark:text-slate-400 mt-0.5 font-medium">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex gap-4 max-w-md mx-auto w-full print-hide">
              <button onClick={() => window.print()} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs flex justify-center items-center gap-1.5">
                <Printer className="w-4 h-4" />
                <span>Invoice Receipt</span>
              </button>
              <button onClick={returnToMenuFromTracking} className="flex-1 py-3 bg-blinkit-green text-white font-bold rounded-2xl text-xs flex justify-center items-center gap-1.5 active:scale-95 transition-all">
                <ArrowLeftCircle className="w-4 h-4" />
                <span>Back to Menu</span>
              </button>
            </div>

            {/* Printable Receipt layout */}
            <div id="printable-receipt" className="hidden bg-white text-slate-900 p-6 max-w-[80mm] mx-auto text-xs space-y-4">
              <div className="text-center pb-4 border-b border-dashed space-y-1">
                <h3 className="font-extrabold text-lg uppercase">{settings.restaurantName}</h3>
                <p className="text-[10px] text-slate-400">{settings.address}</p>
                <p className="text-[10px] text-slate-400">{settings.phone}</p>
              </div>
              <div className="py-3 border-b border-dashed grid grid-cols-2 gap-y-1 text-[9px]">
                <div><span>Bill No:</span> <strong>{activeOrder.id}</strong></div>
                <div className="text-right"><span>Date:</span> <strong>{new Date(activeOrder.createdAt).toLocaleDateString()}</strong></div>
                <div><span>Table:</span> <strong>Table {(activeOrder.tableId || '').replace('tab_','')}</strong></div>
                <div className="text-right"><span>Customer:</span> <strong>{activeOrder.customerName}</strong></div>
              </div>
              <div className="py-3 border-b border-dashed space-y-2">
                <div className="flex justify-between font-bold text-[9px] uppercase text-slate-400">
                  <span>Item</span>
                  <span>Qty</span>
                  <span className="text-right">Total</span>
                </div>
                {activeOrder.items.map(it => (
                  <div key={it.id} className="flex justify-between text-[9px] py-0.5">
                    <span>{it.name}</span>
                    <span>{it.quantity} x {settings.currency}{it.price.toFixed(0)}</span>
                    <span className="text-right">{settings.currency}{(it.quantity * it.price).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="py-3 text-[9px] space-y-1.5 border-t">
                <div className="flex justify-between"><span>Subtotal</span><span>{settings.currency}{activeOrder.subtotal.toFixed(0)}</span></div>
                <div className="flex justify-between text-slate-450 pl-2"><span>GST ({settings.taxRate}%)</span><span>{settings.currency}{activeOrder.tax.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Service charge</span><span>{settings.currency}{activeOrder.serviceCharge.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t"><span>Grand Total</span><span>{settings.currency}{activeOrder.grandTotal.toFixed(2)}</span></div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 1. Table Selector Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 print-hide">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-[30px] p-6 shadow-2xl animate-slide-up space-y-6">
            <div className="text-center">
              <h3 className="font-extrabold text-xl">Select Seated Table</h3>
              <p className="text-xs text-slate-400 mt-1">Please select the table you are currently seated at to begin ordering.</p>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {tables.map(t => (
                <button 
                  key={t.id}
                  onClick={() => confirmTableSelection(t.id)}
                  className="flex flex-col items-center justify-center p-3 border-2 border-slate-200 dark:border-slate-800 hover:border-blinkit-yellow rounded-2xl text-xs font-bold transition-all select-none text-slate-800 dark:text-slate-100"
                >
                  <span>T-{t.id.replace('tab_', '')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Slide Up Basket Drawer Drawer */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs flex items-end justify-center print-hide">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-t-[32px] p-6 shadow-2xl flex flex-col max-h-[85vh] animate-slide-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blinkit-green" />
                <span>My Basket</span>
              </h3>
              <button onClick={() => setIsCartDrawerOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] font-extrabold text-blinkit-green">{settings.currency}{item.price.toFixed(0)}</p>
                      <input 
                        type="text" 
                        value={item.instructions}
                        onChange={(e) => updateItemInstructions(item.id, e.target.value)}
                        placeholder="Instructions (e.g. less spice)..." 
                        className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-0.5 text-[9px] focus:outline-none focus:border-blinkit-green text-slate-550" 
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => changeQuantity(item.id, -1)} className="w-5.5 h-5.5 bg-slate-200 dark:bg-slate-800 rounded-md text-xs hover:bg-rose-500 hover:text-white flex items-center justify-center">-</button>
                      <span className="text-xs font-extrabold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => changeQuantity(item.id, 1)} className="w-5.5 h-5.5 bg-slate-200 dark:bg-slate-800 rounded-md text-xs hover:bg-blinkit-green hover:text-white flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kitchen Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., Make it spicy, Jain food..." 
                  className="w-full p-3 text-xs bg-slate-100 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blinkit-green focus:outline-none resize-none h-16 transition-all"
                ></textarea>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Checkout Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Your Name *</label>
                    <input type="text" value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Aarav Sharma" className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs focus:ring-2 focus:ring-blinkit-green focus:outline-none text-slate-800 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Mobile Number *</label>
                    <input type="tel" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="9876543210" pattern="^[6-9]\d{9}$" maxLength={10} className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs focus:ring-2 focus:ring-blinkit-green focus:outline-none text-slate-800 dark:text-slate-100" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Total Guests Sitting *</label>
                  <input type="number" min="1" max="10" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs focus:ring-2 focus:ring-blinkit-green focus:outline-none text-slate-800 dark:text-slate-100" />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Payment Channel</label>
                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                    <label className={`flex flex-col items-center justify-center p-2.5 border rounded-2xl cursor-pointer select-none relative ${paymentChannel === 'UPI' ? 'border-2 border-blinkit-green bg-blinkit-green/5' : 'border-slate-200'}`}>
                      <input type="radio" checked={paymentChannel === 'UPI'} onChange={() => setPaymentChannel('UPI')} name="payment" className="absolute top-2 right-2 accent-blinkit-green" />
                      <QrCode className="w-5 h-5 text-blinkit-green mb-1" />
                      <span className="text-[9px]">UPI QR</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-2.5 border rounded-2xl cursor-pointer select-none relative ${paymentChannel === 'Cash' ? 'border-2 border-blinkit-green bg-blinkit-green/5' : 'border-slate-200'}`}>
                      <input type="radio" checked={paymentChannel === 'Cash'} onChange={() => setPaymentChannel('Cash')} name="payment" className="absolute top-2 right-2 accent-blinkit-green" />
                      <Banknote className="w-5 h-5 text-amber-500 mb-1" />
                      <span className="text-[9px]">Cash</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-2.5 border rounded-2xl cursor-pointer select-none relative ${paymentChannel === 'Card' ? 'border-2 border-blinkit-green bg-blinkit-green/5' : 'border-slate-200'}`}>
                      <input type="radio" checked={paymentChannel === 'Card'} onChange={() => setPaymentChannel('Card')} name="payment" className="absolute top-2 right-2 accent-blinkit-green" />
                      <CreditCard className="w-5 h-5 text-indigo-500 mb-1" />
                      <span className="text-[9px]">Card</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-450">
                <div className="flex justify-between"><span>Item Subtotal</span><span>{settings.currency}{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-[10px] text-slate-400 pl-2"><span>CGST (2.5%)</span><span>{settings.currency}{cgst.toFixed(2)}</span></div>
                <div className="flex justify-between text-[10px] text-slate-400 pl-2"><span>SGST (2.5%)</span><span>{settings.currency}{sgst.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Service Surcharge (5%)</span><span>{settings.currency}{serviceCharge.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-800 dark:text-slate-100 font-extrabold text-sm pt-2 border-t">
                  <span>Grand Total</span>
                  <span>{settings.currency}{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <button onClick={handleCheckoutSubmit} className="w-full py-4 bg-blinkit-green hover:bg-emerald-700 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md">
                <span>Place Cooking Ticket</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. UPI scanner simulation */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 print-hide">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-[30px] p-6 text-center shadow-2xl flex flex-col items-center justify-center space-y-5">
            <h4 className="font-extrabold text-sm">Scan & Pay using UPI</h4>
            <div className="bg-blinkit-green/10 text-blinkit-green px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5">
              <span>{settings.currency}{grandTotal.toFixed(0)}</span>
            </div>
            <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-3xl flex items-center justify-center">
              <QrCode className="w-36 h-36 text-slate-800 dark:text-slate-200" />
            </div>
            <div className="text-xs text-amber-500 font-semibold animate-pulse">Waiting for transaction authorization...</div>
          </div>
        </div>
      )}

      {/* 4. Payment processing loader */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-55 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 print-hide">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-[30px] p-8 text-center shadow-2xl flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full border-4 border-t-blinkit-green border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div>
              <h4 className="font-extrabold text-lg">{paymentStatus.title}</h4>
              <p className="text-xs text-slate-405 mt-1">{paymentStatus.desc}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
