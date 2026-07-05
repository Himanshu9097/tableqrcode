import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  LayoutGrid, LineChart, Moon, Sun, LogOut, 
  Search, RotateCcw, ShoppingCart, UserPlus, 
  Trash2, PauseCircle, QrCode, CheckSquare, 
  Printer, X, Archive, CheckCircle, AlertCircle 
} from 'lucide-react';

export default function POS() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Auth Session
  const [sessionUser, setSessionUser] = useState(null);
  const [restaurantId, setRestaurantId] = useState('');
  
  // Settings & Lists
  const [settings, setSettings] = useState({ currency: '₹', taxRate: 5, serviceChargeRate: 5 });
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [tables, setTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // States
  const [theme, setTheme] = useState('dark');
  const [toast, setToast] = useState(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState(null); // 'veg', 'nonveg', or null
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Cart Ticket
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('Walk-In');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notes, setNotes] = useState('');

  // Stack of Held/Parked Tickets
  const [heldTickets, setHeldTickets] = useState([]);

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [activeBill, setActiveBill] = useState(null);
  
  // Form Fields
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Mobile layout switch
  const [mobileTab, setMobileTab] = useState('foods'); // 'foods' or 'ticket'

  useEffect(() => {
    // 1. Session verification
    const session = JSON.parse(localStorage.getItem('qr_rest_session'));
    const rest = searchParams.get('restaurant') || session?.restaurantId;
    
    if (!session) {
      navigate(`/login?restaurant=${rest || 'swad_express'}&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setSessionUser(session);
    setRestaurantId(rest);
    
    // Load local parked orders
    const savedHeld = localStorage.getItem(`pos_held_${rest}`);
    if (savedHeld) {
      setHeldTickets(JSON.parse(savedHeld));
    }

    document.documentElement.classList.add('dark');
    fetchStoreData(rest);
  }, [searchParams]);

  const fetchStoreData = async (restId) => {
    try {
      const [settingsRes, catsRes, foodsRes, tablesRes, custsRes] = await Promise.all([
        api.get(`/settings?restaurantId=${restId}`),
        api.get(`/categories?restaurantId=${restId}`),
        api.get(`/foods?restaurantId=${restId}`),
        api.get(`/tables?restaurantId=${restId}`),
        api.get(`/customers?restaurantId=${restId}`)
      ]);

      setSettings(settingsRes.data);
      setCategories(catsRes.data);
      setFoods(foodsRes.data);
      setTables(tablesRes.data);
      setCustomers(custsRes.data);

      // Check for account suspension block
      const tenantsRes = await api.get('/restaurants');
      const tenant = tenantsRes.data.find(t => t.id === restId);
      if (tenant && tenant.status === 'Suspended') {
        document.body.innerHTML = `
          <div class="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div class="p-4 bg-rose-500/10 text-rose-500 rounded-3xl border border-rose-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-bounce"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h1 class="text-2xl font-black text-white uppercase">Terminal Suspended</h1>
            <p class="text-slate-400 text-xs max-w-sm leading-relaxed font-semibold">
              Access to the staff dashboard for <span class="text-rose-400 font-extrabold">${tenant.name}</span> is temporarily suspended.
            </p>
          </div>
        `;
      }
    } catch (err) {
      showToast('Error loading store config details', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('qr_rest_session');
    navigate(`/login?restaurant=${restaurantId}`);
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

  // Add Item to Cart
  const addToCart = (food) => {
    const existing = cart.find(it => it.id === food.id);
    if (existing) {
      setCart(cart.map(it => it.id === food.id ? { ...it, quantity: it.quantity + 1 } : it));
    } else {
      setCart([...cart, { id: food.id, name: food.name, price: food.price, quantity: 1, instructions: '' }]);
    }
    showToast(`Added ${food.name}`);
  };

  // Adjust item quantity in cart
  const adjustQuantity = (foodId, delta) => {
    setCart(cart.map(it => {
      if (it.id === foodId) {
        const qty = it.quantity + delta;
        return qty > 0 ? { ...it, quantity: qty } : null;
      }
      return it;
    }).filter(Boolean));
  };

  const updateItemInstructions = (foodId, inst) => {
    setCart(cart.map(it => it.id === foodId ? { ...it, instructions: inst } : it));
  };

  // Math totals
  const subtotal = cart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const discountVal = parseFloat(((subtotal * discountPercent) / 100).toFixed(2));
  const netSubtotal = subtotal - discountVal;

  const cgst = parseFloat(((netSubtotal * (settings.taxRate / 2)) / 100).toFixed(2));
  const sgst = parseFloat(((netSubtotal * (settings.taxRate / 2)) / 100).toFixed(2));
  const totalTax = cgst + sgst;
  const serviceCharge = parseFloat(((netSubtotal * settings.serviceChargeRate) / 100).toFixed(2));
  const grandTotal = parseFloat((netSubtotal + totalTax + serviceCharge).toFixed(2));

  // Park / Hold order
  const parkActiveOrder = () => {
    if (cart.length === 0) {
      showToast('Cannot park an empty ticket.', 'error');
      return;
    }

    const parked = {
      heldId: 'held_' + Date.now(),
      tableId: selectedTable,
      customerPhone: selectedCustomer,
      items: [...cart],
      discountPercent,
      notes,
      createdAt: new Date().toISOString()
    };

    const newHeld = [...heldTickets, parked];
    setHeldTickets(newHeld);
    localStorage.setItem(`pos_held_${restaurantId}`, JSON.stringify(newHeld));

    // Clear active ticket
    setCart([]);
    setSelectedTable('');
    setSelectedCustomer('Walk-In');
    setDiscountPercent(0);
    setNotes('');
    showToast('Active ticket parked in held stack.', 'success');
  };

  // Resume held ticket
  const resumeHeldTicket = (held) => {
    setCart(held.items);
    setSelectedTable(held.tableId);
    setSelectedCustomer(held.customerPhone);
    setDiscountPercent(held.discountPercent);
    setNotes(held.notes || '');

    // Remove from held stack
    const newHeld = heldTickets.filter(h => h.heldId !== held.heldId);
    setHeldTickets(newHeld);
    localStorage.setItem(`pos_held_${restaurantId}`, JSON.stringify(newHeld));
    showToast('Held ticket loaded back to POS register.', 'success');
  };

  // Delete held ticket
  const discardHeldTicket = (e, heldId) => {
    e.stopPropagation();
    const newHeld = heldTickets.filter(h => h.heldId !== heldId);
    setHeldTickets(newHeld);
    localStorage.setItem(`pos_held_${restaurantId}`, JSON.stringify(newHeld));
    showToast('Held ticket discarded.', 'error');
  };

  // Add Customer modal submit
  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(newCustPhone)) {
      showToast('Enter valid 10-digit phone', 'error');
      return;
    }

    try {
      const res = await api.post(`/customers/find-or-create?restaurantId=${restaurantId}`, {
        name: newCustName,
        phone: newCustPhone
      });

      // Reload dropdown and select customer
      const custsList = await api.get(`/customers?restaurantId=${restaurantId}`);
      setCustomers(custsList.data);
      setSelectedCustomer(res.data.phone);

      showToast(`${newCustName} registered loyalty successfully!`);
      setIsCustomerModalOpen(false);
      setNewCustName('');
      setNewCustPhone('');
    } catch (err) {
      showToast('Loyalty lookup error', 'error');
    }
  };

  // Checkout trigger
  const triggerCheckout = async (paymentMethod) => {
    if (cart.length === 0) {
      showToast('Empty ticket basket.', 'error');
      return;
    }
    if (!selectedTable) {
      showToast('Please select table.', 'error');
      return;
    }

    const currentCustObj = customers.find(c => c.phone === selectedCustomer) || { name: 'Walk-In' };

    const payload = {
      customerName: currentCustObj.name,
      customerPhone: selectedCustomer === 'Walk-In' ? '' : selectedCustomer,
      tableId: selectedTable,
      items: cart,
      subtotal,
      discount: discountPercent,
      tax: totalTax,
      serviceCharge,
      grandTotal,
      paymentMethod,
      notes
    };

    if (paymentMethod === 'UPI QR') {
      setIsUpiModalOpen(true);
      // Simulate UPI scan wait (4 seconds)
      setTimeout(async () => {
        setIsUpiModalOpen(false);
        await processCheckoutApi(payload);
      }, 4000);
    } else {
      await processCheckoutApi(payload);
    }
  };

  const processCheckoutApi = async (payload) => {
    try {
      const res = await api.post(`/orders?restaurantId=${restaurantId}`, payload);
      setActiveBill(res.data);
      setIsReceiptModalOpen(true);
      showToast('Order checkout finished successfully!', 'success');

      // Clear ticket state
      setCart([]);
      setSelectedTable('');
      setSelectedCustomer('Walk-In');
      setDiscountPercent(0);
      setNotes('');

      // Refresh listings
      fetchStoreData(restaurantId);
    } catch (err) {
      showToast('Order checkout placement failed', 'error');
    }
  };

  // Search & Filter Foods
  const filteredFoods = foods.filter(f => {
    if (!f.isAvailable) return false;
    if (selectedCategory && f.categoryId !== selectedCategory) return false;
    if (vegFilter === 'veg' && !f.isVeg) return false;
    if (vegFilter === 'nonveg' && f.isVeg) return false;
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-55 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg border border-white/10 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white animate-slide-up print-hide`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* POS Top Bar */}
      <header className="h-16 border-b border-slate-200/50 dark:border-slate-800/40 glass-panel sticky top-0 z-30 px-6 flex items-center justify-between print-hide">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-none">POS Terminal</h1>
            <p className="text-[10px] text-slate-400 mt-1">Cashier Desk #1 • {settings.restaurantName || 'Loading...'}</p>
          </div>
        </div>

        {/* Active Staff Profile & Actions */}
        <div className="flex items-center gap-4">
          
          {(sessionUser?.role === 'Admin' || sessionUser?.role === 'Manager') && (
            <button 
              onClick={() => navigate(`/admin?restaurant=${restaurantId}`)} 
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-slate-200 dark:bg-slate-900 hover:bg-emerald-500/15 text-slate-700 dark:text-slate-200 hover:text-emerald-500 text-xs font-bold rounded-2xl transition-all"
            >
              <LineChart className="w-4 h-4" />
              <span>Go To Admin Panel</span>
            </button>
          )}

          {/* Theme Switch */}
          <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl transition-all">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Staff Identity */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            <img src={sessionUser?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{sessionUser?.name || 'Cashier'}</p>
              <p className="text-[10px] text-slate-400 leading-none">Role: {sessionUser?.role || 'Staff'}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors ml-1" title="Log Out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 lg:hidden print-hide bg-white dark:bg-slate-900 sticky top-16 z-20">
        <button 
          onClick={() => setMobileTab('foods')} 
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider border-b-2 ${mobileTab === 'foods' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500'}`}
        >
          Browse Menu
        </button>
        <button 
          onClick={() => setMobileTab('ticket')} 
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider border-b-2 ${mobileTab === 'ticket' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500'}`}
        >
          Active Ticket ({cart.reduce((sum, it) => sum + it.quantity, 0)})
        </button>
      </div>

      {/* POS Layout Workspace */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 print-hide">
        
        {/* Left panel: Categories filter + Products Grid */}
        <div className={`lg:col-span-7 flex flex-col gap-4 ${mobileTab !== 'foods' ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Top Filters bar */}
          <div className="glass-card p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Indian dishes..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
              />
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setVegFilter(vegFilter === 'veg' ? null : 'veg')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${vegFilter === 'veg' ? 'bg-emerald-500 text-white border-transparent' : 'bg-slate-100 dark:bg-slate-900 border-transparent hover:bg-emerald-500/10 text-slate-500'}`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Veg Only</span>
              </button>
              
              <button 
                onClick={() => setVegFilter(vegFilter === 'nonveg' ? null : 'nonveg')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${vegFilter === 'nonveg' ? 'bg-rose-500 text-white border-transparent' : 'bg-slate-100 dark:bg-slate-900 border-transparent hover:bg-rose-500/10 text-slate-500'}`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Non-Veg</span>
              </button>
              
              {(searchQuery || vegFilter || selectedCategory) && (
                <button 
                  onClick={() => { setSearchQuery(''); setVegFilter(null); setSelectedCategory(null); }}
                  className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Scroll tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${selectedCategory === null ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100'}`}
            >
              All
            </button>
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all flex items-center gap-1.5 ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100'}`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Foods Grid */}
          <div className="flex-1 min-h-[450px] max-h-[68vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFoods.map(food => {
                const isItemInCart = cart.find(it => it.id === food.id);
                return (
                  <div 
                    key={food.id}
                    onClick={() => addToCart(food)}
                    className={`bg-white dark:bg-slate-900 border ${isItemInCart ? 'border-emerald-500' : 'border-slate-200/50 dark:border-slate-800/40'} p-3 rounded-2xl cursor-pointer hover:shadow-md hover:border-emerald-500 transition-all select-none flex flex-col justify-between h-28 border-l-4 ${food.isVeg ? 'border-l-emerald-500' : 'border-l-rose-500'} group`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors line-clamp-2">{food.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">{food.isVeg ? 'Veg' : 'Non-Veg'}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-black">{settings.currency}{food.price.toFixed(0)}</span>
                      {isItemInCart ? (
                        <div className="w-fit px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg">
                          {isItemInCart.quantity} Qty
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredFoods.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="font-bold text-xs">No matching dishes found.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right panel: Cart + Customer allocation + Checkout Details */}
        <div className={`lg:col-span-5 flex flex-col gap-6 ${mobileTab !== 'ticket' ? 'hidden lg:flex' : 'flex'}`}>
          
          <div className="glass-card p-5 rounded-3xl flex-1 flex flex-col justify-between space-y-4">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-500" />
                <span>Current Ticket</span>
              </h3>
              <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                {cart.reduce((sum, it) => sum + it.quantity, 0)} Portions
              </span>
            </div>

            {/* Ticket Configuration */}
            <div className="grid grid-cols-2 gap-4">
              {/* Table selector dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Table *</label>
                <select 
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100"
                >
                  <option value="" disabled>-- Table --</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Loyalty Customer</label>
                <div className="flex gap-2">
                  <select 
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100"
                  >
                    <option value="Walk-In">Walk-In Customer</option>
                    {customers.map(c => (
                      <option key={c.phone} value={c.phone}>
                        {c.name} (+91 {c.phone})
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Ticket Items List */}
            <div className="flex-1 overflow-y-auto max-h-[250px] min-h-[160px] space-y-3 pr-1">
              {cart.map((item, idx) => (
                <div key={item.id} className="flex items-start justify-between gap-3 bg-slate-100/50 dark:bg-slate-900/30 p-2.5 rounded-2xl border border-slate-200/20 dark:border-slate-800/40">
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] font-black text-emerald-500">{settings.currency}{item.price.toFixed(0)}</p>
                    <input 
                      type="text" 
                      value={item.instructions}
                      onChange={(e) => updateItemInstructions(item.id, e.target.value)}
                      placeholder="Chef instructions..." 
                      className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-0.5 text-[9px] focus:outline-none focus:border-emerald-500 text-slate-500 font-medium" 
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => adjustQuantity(item.id, -1)} className="w-5.5 h-5.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded flex items-center justify-center font-bold text-xs">-</button>
                    <span className="text-xs font-extrabold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => adjustQuantity(item.id, 1)} className="w-5.5 h-5.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded flex items-center justify-center font-bold text-xs">+</button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex flex-col justify-center items-center text-slate-400 py-10">
                  <ShoppingCart className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold">Ticket is empty.</p>
                </div>
              )}
            </div>

            {/* Calculations and Finance */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              
              {/* Discount input */}
              <div className="flex items-center justify-between gap-4 bg-slate-100/50 dark:bg-slate-900/30 p-2.5 rounded-2xl">
                <span className="font-semibold text-slate-500">Apply Discount</span>
                <div className="flex items-center gap-1.5 max-w-[120px]">
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 p-1 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none" 
                  />
                  <span className="text-xs font-bold">%</span>
                </div>
              </div>

              {/* Price Summaries (GST split) */}
              <div className="space-y-1.5 text-slate-500 font-semibold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{settings.currency}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-rose-500">-{settings.currency}{discountVal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pl-2">
                  <span>CGST (2.5%)</span>
                  <span>{settings.currency}{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pl-2">
                  <span>SGST (2.5%)</span>
                  <span>{settings.currency}{sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge (5%)</span>
                  <span>{settings.currency}{serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-base text-slate-800 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Grand Total</span>
                  <span>{settings.currency}{grandTotal.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Action Checkout Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button 
                onClick={parkActiveOrder}
                className="py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl transition-all active:scale-95 text-xs flex flex-col items-center justify-center gap-1"
              >
                <PauseCircle className="w-4 h-4" />
                <span>Hold</span>
              </button>
              
              <button 
                onClick={() => triggerCheckout('UPI QR')}
                className="py-3 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white text-indigo-500 font-bold rounded-2xl transition-all active:scale-95 text-xs flex flex-col items-center justify-center gap-1"
              >
                <QrCode className="w-4 h-4" />
                <span>UPI QR</span>
              </button>

              <button 
                onClick={() => triggerCheckout('Cash')}
                className="py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-md shadow-emerald-500/10 text-xs flex flex-col items-center justify-center gap-1"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Cash Pay</span>
              </button>
            </div>

          </div>

          {/* Parked/Held Ticket Monitor */}
          <div className="glass-card p-4 rounded-3xl space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Archive className="w-4 h-4" />
              <span>Held Tickets Stack ({heldTickets.length})</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {heldTickets.map((h, i) => (
                <div 
                  key={h.heldId}
                  onClick={() => resumeHeldTicket(h)}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-emerald-500 rounded-2xl text-[10px] font-bold cursor-pointer flex items-center gap-2"
                >
                  <span>T-{(h.tableId || '').replace('tab_','')} ({h.items.reduce((s, it) => s + it.quantity, 0)} Items)</span>
                  <button onClick={(e) => discardHeldTicket(e, h.heldId)} className="text-slate-400 hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {heldTickets.length === 0 && (
                <span className="text-[10px] text-slate-500 italic">No tickets currently on hold.</span>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 1. New Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print-hide">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-[30px] p-6 shadow-2xl animate-slide-up space-y-4 relative">
            <button 
              onClick={() => setIsCustomerModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg">Add New Customer</h3>
            <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full p-3 text-sm bg-slate-100 dark:bg-slate-950 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-semibold text-slate-400 select-none">
                    +91
                  </span>
                  <input 
                    type="tel" 
                    required 
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="9876543210" 
                    pattern="^[6-9]\d{9}$" 
                    maxLength={10}
                    className="w-full pl-12 pr-3 py-3 text-sm bg-slate-100 dark:bg-slate-950 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-md transition-all">
                Register Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. UPI Modal */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 print-hide">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-[30px] p-6 text-center shadow-2xl flex flex-col items-center justify-center space-y-5">
            <div className="w-full flex justify-between items-center border-b pb-3">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">UPI Scan Code Authorization</h4>
            </div>

            <div className="bg-blinkit-green/10 text-blinkit-green px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5">
              <span>{settings.currency}{grandTotal.toFixed(0)}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-center shadow-sm">
              <div className="w-40 h-40 bg-slate-100 flex flex-col justify-center items-center rounded-2xl text-slate-400">
                <QrCode className="w-16 h-16 mb-2" />
                <span className="text-[10px] font-bold">MOCK UPI QR</span>
              </div>
            </div>

            <div className="space-y-1.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">{settings.restaurantName}</p>
              <p className="text-[9px] text-slate-400">BHIM UPI QR scan waiting...</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-amber-500 justify-center py-2 animate-pulse">
              <div className="w-3 h-3 rounded-full border-2 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <span>Authorizing transaction secure gateway...</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Checkout Success & Receipt Print Modal */}
      {isReceiptModalOpen && activeBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 print-hide">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-[30px] p-6 shadow-2xl flex flex-col justify-between max-h-[85vh]">
            
            <div className="overflow-y-auto p-1 flex-1">
              <div id="printable-receipt" className="text-slate-900 p-6 border border-slate-200 rounded-2xl relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-amber-500"></div>

                <div className="text-center pb-4 border-b border-dashed border-slate-200 space-y-1">
                  <h3 className="font-extrabold text-lg uppercase tracking-wider text-slate-800">{settings.restaurantName}</h3>
                  <p className="text-[9px] text-slate-400">{settings.address}</p>
                  <p className="text-[9px] text-slate-400">{settings.phone}</p>
                </div>

                <div className="py-3 border-b border-dashed border-slate-200 grid grid-cols-2 gap-y-1.5 text-[9px]">
                  <div><span className="text-slate-400">Bill No:</span> <strong>{activeBill.id}</strong></div>
                  <div className="text-right"><span class="text-slate-400">Date:</span> <strong>{new Date(activeBill.createdAt).toLocaleDateString()}</strong></div>
                  <div><span className="text-slate-400">Table:</span> <strong>Table {(activeBill.tableId || '').replace('tab_','')}</strong></div>
                  <div className="text-right"><span class="text-slate-400">Customer:</span> <strong>{activeBill.customerName || 'Walk-In'}</strong></div>
                  <div><span className="text-slate-400">Cashier:</span> <strong>{sessionUser?.name}</strong></div>
                  <div className="text-right"><span class="text-slate-400">Status:</span> <strong>{activeBill.paymentStatus} ({activeBill.paymentMethod})</strong></div>
                </div>

                <div className="py-3 border-b border-dashed border-slate-200 space-y-2">
                  <div className="flex justify-between font-bold text-[9px] uppercase text-slate-400">
                    <span>Item</span>
                    <span>Qty x Price</span>
                    <span className="text-right">Total</span>
                  </div>
                  <div className="space-y-1.5 text-[9px] text-slate-800">
                    {activeBill.items.map(it => (
                      <div key={it.id} className="flex justify-between py-0.5">
                        <span>{it.name}</span>
                        <span>{it.quantity} x {settings.currency}{it.price.toFixed(0)}</span>
                        <span className="text-right">{settings.currency}{(it.quantity * it.price).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="py-3 space-y-1.5 text-[9px] text-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span>{settings.currency}{activeBill.subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Discount Applied</span>
                    <span className="text-rose-500">-{settings.currency}{((activeBill.subtotal * activeBill.discount) / 100).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pl-2">
                    <span>CGST (2.5%)</span>
                    <span>{settings.currency}{(activeBill.tax / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pl-2">
                    <span>SGST (2.5%)</span>
                    <span>{settings.currency}{(activeBill.tax / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service Charge (5%)</span>
                    <span>{settings.currency}{activeBill.serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-slate-200 text-slate-800">
                    <span>Grand Total</span>
                    <span>{settings.currency}{activeBill.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-dashed border-slate-200 text-[8px] text-slate-400">
                  <p>{settings.invoiceFooter}</p>
                  <p>GSTIN: 09AAAAA1111A1Z1 • POS SYSTEM</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button 
                onClick={() => window.print()} 
                className="py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 text-sm shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Bill</span>
              </button>
              <button 
                onClick={() => { setIsReceiptModalOpen(false); setActiveBill(null); }}
                className="py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-sm"
              >
                New POS Transaction
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Hidden print invoice frame for window.print() */}
      {activeBill && (
        <div id="printable-receipt" className="hidden bg-white text-slate-900 p-6 max-w-[80mm] mx-auto text-xs space-y-4">
          <div className="text-center pb-4 border-b border-dashed space-y-1">
            <h3 className="font-extrabold text-base uppercase">{settings.restaurantName}</h3>
            <p className="text-[9px] text-slate-400">{settings.address}</p>
            <p className="text-[9px] text-slate-400">{settings.phone}</p>
          </div>
          <div className="py-3 border-b border-dashed grid grid-cols-2 gap-y-1 text-[9px]">
            <div><span>Bill No:</span> <strong>{activeBill.id}</strong></div>
            <div className="text-right"><span>Date:</span> <strong>{new Date(activeBill.createdAt).toLocaleDateString()}</strong></div>
            <div><span>Table:</span> <strong>Table {(activeBill.tableId || '').replace('tab_','')}</strong></div>
            <div className="text-right"><span>Customer:</span> <strong>{activeBill.customerName || 'Walk-In'}</strong></div>
            <div><span>Cashier:</span> <strong>{sessionUser?.name}</strong></div>
            <div className="text-right"><span>Payment:</span> <strong>{activeBill.paymentMethod}</strong></div>
          </div>
          <div className="py-3 border-b border-dashed space-y-2">
            <div className="flex justify-between font-bold text-[9px] uppercase text-slate-400">
              <span>Item</span>
              <span>Qty x Price</span>
              <span className="text-right">Total</span>
            </div>
            {activeBill.items.map(it => (
              <div key={it.id} className="flex justify-between text-[9px] py-0.5">
                <span>{it.name}</span>
                <span>{it.quantity} x {settings.currency}{it.price.toFixed(0)}</span>
                <span className="text-right">{settings.currency}{(it.quantity * it.price).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="py-3 text-[9px] space-y-1.5">
            <div className="flex justify-between"><span>Subtotal</span><span>{settings.currency}{activeBill.subtotal.toFixed(0)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-{settings.currency}{((activeBill.subtotal * activeBill.discount) / 100).toFixed(0)}</span></div>
            <div className="flex justify-between text-slate-400 pl-2"><span>CGST (2.5%)</span><span>{settings.currency}{(activeBill.tax / 2).toFixed(2)}</span></div>
            <div className="flex justify-between text-slate-400 pl-2"><span>SGST (2.5%)</span><span>{settings.currency}{(activeBill.tax / 2).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Service (5%)</span><span>{settings.currency}{activeBill.serviceCharge.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-xs pt-1.5 border-t"><span>Total</span><span>{settings.currency}{activeBill.grandTotal.toFixed(2)}</span></div>
          </div>
          <div className="text-center pt-4 border-t border-dashed text-[8px] text-slate-400">
            <p>{settings.invoiceFooter}</p>
          </div>
        </div>
      )}

    </div>
  );
}
