import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  LayoutDashboard, ClipboardList, Table as TableIcon, 
  Menu as MenuIcon, Users, UserCog, FileText, Settings as SettingsIcon,
  Moon, Sun, RefreshCw, Banknote, ShoppingCart, TableProperties, Flame,
  Monitor, Plus, Trash2, Edit, Check, X, ShieldAlert,
  ArrowLeft, Download, Upload, CheckCircle, AlertCircle, Eye, Search, Printer, Database
} from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [restaurantId, setRestaurantId] = useState('');
  
  // Scoped Data Lists
  const [settings, setSettings] = useState({ restaurantName: 'QuickQR Restaurant', currency: '₹', taxRate: 5, serviceChargeRate: 5 });
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [tables, setTables] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Dashboard & Navigation states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [toast, setToast] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Modal Dialog states
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null); // null for new
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Forms Fields - Food
  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodCat, setFoodCat] = useState('');
  const [foodVeg, setFoodVeg] = useState(true);
  const [foodAvail, setFoodAvail] = useState(true);
  const [foodImage, setFoodImage] = useState('');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodSpecial, setFoodSpecial] = useState(false);

  // Forms Fields - Employee
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState('Cashier');
  const [empPhone, setEmpPhone] = useState('');
  const [empStatus, setEmpStatus] = useState('Active');
  const [empImage, setEmpImage] = useState('');
  const [empPassword, setEmpPassword] = useState('');

  // Forms Fields - Settings
  const [setRestName, setSetRestName] = useState('');
  const [setRestLogo, setSetRestLogo] = useState('');
  const [setAddress, setSetAddress] = useState('');
  const [setPhone, setSetPhone] = useState('');
  const [setEmail, setSetEmail] = useState('');
  const [setCurrency, setSetCurrency] = useState('₹');
  const [setTax, setSetTax] = useState(5);
  const [setService, setSetService] = useState(5);
  const [setOpenTime, setSetOpenTime] = useState('11:00');
  const [setCloseTime, setSetCloseTime] = useState('23:00');
  const [setThemeMode, setSetThemeMode] = useState('dark');
  const [setInvoiceFooter, setSetInvoiceFooter] = useState('');

  // Form Fields - Category Create
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('utensils');

  // Form Fields - Table Create
  const [newTableName, setNewTableName] = useState('');
  const [newTableCap, setNewTableCap] = useState(4);

  // Reports Date range
  const [reportPeriod, setReportPeriod] = useState('today');
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');

  // Search CMS filters
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterCat, setMenuFilterCat] = useState('');
  const [custSearch, setCustSearch] = useState('');

  // Live Screen views: Kanban vs KDS Screen
  const [isKdsScreen, setIsKdsScreen] = useState(false);
  const [activeQRTable, setActiveQRTable] = useState('');

  useEffect(() => {
    // 1. Session verification
    const session = JSON.parse(localStorage.getItem('qr_rest_session'));
    const rest = searchParams.get('restaurant') || session?.restaurantId;

    if (!session || (session.role !== 'Admin' && session.role !== 'Manager' && session.role !== 'SuperAdmin')) {
      navigate(`/login?restaurant=${rest || 'swad_express'}&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setSessionUser(session);
    setRestaurantId(rest);
    document.documentElement.classList.add('dark');
    fetchDashboardData(rest);

    // Setup periodic sync (5 seconds polling for KDS/orders update)
    const interval = setInterval(() => {
      syncLiveOrders(rest);
    }, 5000);

    return () => clearInterval(interval);
  }, [searchParams]);

  const fetchDashboardData = async (restId) => {
    setIsSyncing(true);
    try {
      const [settingsRes, catsRes, foodsRes, tablesRes, empsRes, custsRes, ordersRes] = await Promise.all([
        api.get(`/settings?restaurantId=${restId}`),
        api.get(`/categories?restaurantId=${restId}`),
        api.get(`/foods?restaurantId=${restId}`),
        api.get(`/tables?restaurantId=${restId}`),
        api.get(`/employees?restaurantId=${restId}`),
        api.get(`/customers?restaurantId=${restId}`),
        api.get(`/orders?restaurantId=${restId}`)
      ]);

      setSettings(settingsRes.data);
      setCategories(catsRes.data);
      setFoods(foodsRes.data);
      setTables(tablesRes.data);
      setEmployees(empsRes.data);
      setCustomers(custsRes.data);
      setOrders(ordersRes.data);

      // Populate settings fields on initial load
      setSetRestName(settingsRes.data.restaurantName || '');
      setSetRestLogo(settingsRes.data.restaurantLogo || '');
      setSetAddress(settingsRes.data.address || '');
      setSetPhone(settingsRes.data.phone || '');
      setSetEmail(settingsRes.data.email || '');
      setSetCurrency(settingsRes.data.currency || '₹');
      setSetTax(settingsRes.data.taxRate || 5);
      setSetService(settingsRes.data.serviceChargeRate || 5);
      setSetOpenTime(settingsRes.data.openTime || '11:00');
      setSetCloseTime(settingsRes.data.closeTime || '23:00');
      setSetThemeMode(settingsRes.data.theme || 'dark');
      setSetInvoiceFooter(settingsRes.data.invoiceFooter || '');

      if (tablesRes.data.length > 0) {
        setActiveQRTable(tablesRes.data[0].id);
      }

      // Check for account suspension block
      const tenantsRes = await api.get('/restaurants');
      const tenant = tenantsRes.data.find(t => t.id === restId);
      if (tenant && tenant.status === 'Suspended') {
        document.body.innerHTML = `
          <div class="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div class="p-4 bg-rose-500/10 text-rose-500 rounded-3xl border border-rose-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-bounce"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h1 class="text-2xl font-black text-white uppercase">Restaurant Account Suspended</h1>
            <p class="text-slate-400 text-xs max-w-sm leading-relaxed font-semibold">
              The control panel console access for <span class="text-rose-400 font-extrabold">${tenant.name}</span> has been temporarily suspended.
            </p>
          </div>
        `;
      }
    } catch (err) {
      showToast('Error syncing dashboard coordinates', 'error');
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const syncLiveOrders = async (restId) => {
    try {
      const res = await api.get(`/orders?restaurantId=${restId}`);
      setOrders(res.data);
      // Also sync tables layout status
      const tablesRes = await api.get(`/tables?restaurantId=${restId}`);
      setTables(tablesRes.data);
    } catch (err) {
      console.warn('Orders sync failed', err);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem('qr_rest_session');
    navigate(`/login?restaurant=${restaurantId}`);
  };

  // --- TAB MANAGEMENTS ---
  const switchTab = (tab) => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  // --- KANBAN STATUS UPDATER ---
  const updateOrderStatus = async (orderId, targetStatus) => {
    try {
      const chefSession = employees.find(e => e.role === 'Chef')?.name || 'Kitchen Staff';
      await api.put(`/orders/${orderId}/status?restaurantId=${restaurantId}`, { 
        status: targetStatus,
        preparedBy: targetStatus === 'Preparing' ? chefSession : undefined
      });
      showToast(`Order #${orderId} moved to ${targetStatus}`);
      syncLiveOrders(restaurantId);
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // --- CATEGORIES MANAGEMENT ---
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/categories?restaurantId=${restaurantId}`, {
        name: newCatName,
        icon: newCatIcon
      });
      setCategories([...categories, res.data]);
      showToast(`Category ${newCatName} created!`);
      setNewCatName('');
    } catch (err) {
      showToast('Error creating category', 'error');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete category? Items referencing it will remain.')) return;
    try {
      await api.delete(`/categories/${catId}?restaurantId=${restaurantId}`);
      setCategories(categories.filter(c => c.id !== catId));
      showToast('Category deleted', 'error');
    } catch (err) {
      showToast('Failed to delete category', 'error');
    }
  };

  // --- TABLES MANAGEMENT ---
  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/tables?restaurantId=${restaurantId}`, {
        name: newTableName,
        capacity: newTableCap
      });
      setTables([...tables, res.data]);
      showToast(`Table ${newTableName} added!`);
      setNewTableName('');
    } catch (err) {
      showToast('Error adding table', 'error');
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Delete table?')) return;
    try {
      await api.delete(`/tables/${tableId}?restaurantId=${restaurantId}`);
      setTables(tables.filter(t => t.id !== tableId));
      showToast('Table deleted', 'error');
    } catch (err) {
      showToast('Failed to delete table', 'error');
    }
  };

  const handleTableStatusRelease = async (tableId, targetStatus) => {
    try {
      await api.put(`/tables/${tableId}/status?restaurantId=${restaurantId}`, { status: targetStatus });
      showToast(`Table status set to ${targetStatus}`);
      fetchDashboardData(restaurantId);
    } catch (err) {
      showToast('Failed to update table status', 'error');
    }
  };

  // --- FOODS CMS METHODS ---
  const openFoodEditModal = (food) => {
    setSelectedFood(food);
    if (food) {
      setFoodName(food.name);
      setFoodPrice(food.price);
      setFoodCat(food.categoryId);
      setFoodVeg(food.isVeg);
      setFoodAvail(food.isAvailable);
      setFoodImage(food.image || '');
      setFoodDesc(food.description || '');
      setFoodSpecial(food.isSpecial || false);
    } else {
      setFoodName('');
      setFoodPrice('');
      setFoodCat(categories[0]?.id || '');
      setFoodVeg(true);
      setFoodAvail(true);
      setFoodImage('');
      setFoodDesc('');
      setFoodSpecial(false);
    }
    setIsFoodModalOpen(true);
  };

  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      categoryId: foodCat,
      name: foodName,
      price: parseFloat(foodPrice),
      isVeg: foodVeg,
      isAvailable: foodAvail,
      image: foodImage,
      description: foodDesc,
      isSpecial: foodSpecial
    };

    try {
      if (selectedFood) {
        // Edit
        const res = await api.put(`/foods/${selectedFood.id}?restaurantId=${restaurantId}`, payload);
        setFoods(foods.map(f => f.id === selectedFood.id ? res.data : f));
        showToast('Menu item updated.');
      } else {
        // Create
        const res = await api.post(`/foods?restaurantId=${restaurantId}`, payload);
        setFoods([...foods, res.data]);
        showToast('New menu item registered.');
      }
      setIsFoodModalOpen(false);
    } catch (err) {
      showToast('Failed to save menu item', 'error');
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/foods/${foodId}?restaurantId=${restaurantId}`);
      setFoods(foods.filter(f => f.id !== foodId));
      showToast('Menu item deleted', 'error');
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  // --- STAFF CMS METHODS ---
  const openEmployeeModal = (emp) => {
    setSelectedEmp(emp);
    if (emp) {
      setEmpName(emp.name);
      setEmpEmail(emp.email);
      setEmpRole(emp.role);
      setEmpPhone(emp.contact || '');
      setEmpStatus(emp.status);
      setEmpImage(emp.image || '');
      setEmpPassword('');
    } else {
      setEmpName('');
      setEmpEmail('');
      setEmpRole('Cashier');
      setEmpPhone('');
      setEmpStatus('Active');
      setEmpImage('');
      setEmpPassword('');
    }
    setIsEmpModalOpen(true);
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: empName,
      email: empEmail,
      role: empRole,
      contact: empPhone,
      status: empStatus,
      image: empImage,
      password: empPassword
    };

    try {
      if (selectedEmp) {
        const res = await api.put(`/employees/${selectedEmp.id}?restaurantId=${restaurantId}`, payload);
        setEmployees(employees.map(em => em.id === selectedEmp.id ? res.data : em));
        showToast('Employee profile updated.');
      } else {
        const res = await api.post(`/employees?restaurantId=${restaurantId}`, payload);
        setEmployees([...employees, res.data]);
        showToast('New employee registered.');
      }
      setIsEmpModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save staff details', 'error');
    }
  };

  const handleDeleteEmployee = async (empId) => {
    if (!window.confirm('Delete staff profile?')) return;
    try {
      await api.delete(`/employees/${empId}?restaurantId=${restaurantId}`);
      setEmployees(employees.filter(em => em.id !== empId));
      showToast('Staff profile deleted', 'error');
    } catch (err) {
      showToast('Failed to delete employee', 'error');
    }
  };

  // --- SETTINGS CMS FORM ---
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      restaurantName: setRestName,
      restaurantLogo: setRestLogo,
      address: setAddress,
      phone: setPhone,
      email: setEmail,
      currency: setCurrency,
      taxRate: parseFloat(setTax),
      serviceChargeRate: parseFloat(setService),
      openTime: setOpenTime,
      closeTime: setCloseTime,
      theme: setThemeMode,
      invoiceFooter: setInvoiceFooter
    };

    try {
      await api.post(`/settings?restaurantId=${restaurantId}`, payload);
      showToast('Global store configuration saved.');
      fetchDashboardData(restaurantId);
    } catch (err) {
      showToast('Failed to save settings', 'error');
    }
  };

  // Settings Backups
  const exportJSONDatabase = async () => {
    try {
      const res = await api.get('/backup/export');
      // Filter out records not corresponding to our restaurant ID to build a clean store backup
      const data = res.data;
      const filteredBackup = {
        restaurantId,
        categories: data.categories.filter(c => c.restaurantId === restaurantId),
        foods: data.foods.filter(f => f.restaurantId === restaurantId),
        tables: data.tables.filter(t => t.restaurantId === restaurantId),
        employees: data.employees.filter(e => e.restaurantId === restaurantId),
        settings: data.settings.filter(s => s.restaurantId === restaurantId),
        customers: data.customers.filter(c => c.restaurantId === restaurantId),
        orders: data.orders.filter(o => o.restaurantId === restaurantId)
      };

      const backupString = JSON.stringify(filteredBackup, null, 2);
      const blob = new Blob([backupString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quickqr_store_${restaurantId}_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Store backup exported successfully.");
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  const handleJSONDatabaseImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const payload = JSON.parse(e.target.result);
        if (payload.restaurantId && payload.restaurantId !== restaurantId) {
          showToast('Backup belongs to another restaurant subdomain', 'error');
          return;
        }
        
        // Submit full restoration
        const res = await api.post('/backup/restore', payload);
        if (res.data.success) {
          showToast("Store configuration restored successfully!");
          fetchDashboardData(restaurantId);
        } else {
          showToast(res.data.message, "error");
        }
      } catch (err) {
        showToast("Invalid JSON file template.", "error");
      }
    };
    reader.readAsText(file);
  };

  // --- FINANCE REPORTS FILTERS ---
  const completedOrders = orders.filter(o => o.status === 'Completed');
  
  const getFilteredReportOrders = () => {
    const todayStr = new Date().toDateString();
    
    return completedOrders.filter(o => {
      const oDate = new Date(o.createdAt);
      if (reportPeriod === 'today') {
        return oDate.toDateString() === todayStr;
      } else if (reportPeriod === 'week') {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return oDate.getTime() >= weekAgo;
      } else if (reportPeriod === 'month') {
        const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return oDate.getTime() >= monthAgo;
      } else if (reportPeriod === 'custom') {
        if (!reportStart || !reportEnd) return true;
        const start = new Date(reportStart);
        start.setHours(0,0,0,0);
        const end = new Date(reportEnd);
        end.setHours(23,59,59,999);
        return oDate >= start && oDate <= end;
      }
      return true;
    });
  };

  const reportOrders = getFilteredReportOrders();
  const reportNetSales = reportOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const reportTaxSum = reportOrders.reduce((sum, o) => sum + o.tax, 0);
  const reportGrandSum = reportOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  // --- FILTERS LOGIC ---
  const filteredFoodsCms = foods.filter(f => {
    if (menuFilterCat && f.categoryId !== menuFilterCat) return false;
    if (menuSearch && !f.name.toLowerCase().includes(menuSearch.toLowerCase())) return false;
    return true;
  });

  const filteredCustomersCms = customers.filter(c => {
    if (custSearch && !c.name.toLowerCase().includes(custSearch.toLowerCase()) && !c.phone.includes(custSearch)) return false;
    return true;
  });

  // Today KPI aggregates
  const todayStr = new Date().toDateString();
  const todayOrders = completedOrders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
  const todaySalesVal = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const pendingOrdersList = orders.filter(o => o.status === 'Pending');

  // Drag and Drop implementation
  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('text/plain', orderId);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e, status) => {
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
      updateOrderStatus(orderId, status);
    }
  };

  const getQRPosterUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://table-qr-food.vercel.app';
    const url = `${origin}/customer?restaurant=${restaurantId}&table=${activeQRTable}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex transition-colors duration-300 font-sans w-full">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-55 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg border border-white/10 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white animate-slide-up print-hide`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/40 hidden md:flex flex-col justify-between sticky top-0 h-screen z-25 print-hide">
        <div className="p-6 space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white line-clamp-1">
                {settings.restaurantName}
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Live Orders', icon: ClipboardList },
              { id: 'tables', label: 'Tables Manager', icon: TableIcon },
              { id: 'menu', label: 'Menu Settings', icon: MenuIcon },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'employees', label: 'Employees', icon: UserCog },
              { id: 'reports', label: 'Sales Reports', icon: FileText },
              { id: 'settings', label: 'Global Settings', icon: SettingsIcon },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all w-full text-left ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={sessionUser?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <p className="text-xs font-bold">{sessionUser?.name}</p>
                <p className="text-[9px] text-slate-400">Admin Console</p>
              </div>
            </div>
            
            <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-all">
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button onClick={() => navigate(`/pos?restaurant=${restaurantId}`)} className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 text-slate-700 dark:text-slate-200 hover:text-emerald-500 rounded-xl transition-all text-center border dark:border-slate-800">POS</button>
            <button onClick={handleLogout} className="py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl transition-all">Logout</button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Container */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Mobile Header Nav */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/40 px-6 flex items-center justify-between md:hidden print-hide">
          <span className="font-extrabold text-sm text-emerald-500">{settings.restaurantName}</span>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm md:hidden print-hide">
            <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-500">Navigation</span>
                  <button onClick={() => setIsMobileDrawerOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><X className="w-5 h-5" /></button>
                </div>
                <nav className="flex flex-col gap-1.5">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'orders', label: 'Live Orders', icon: ClipboardList },
                    { id: 'tables', label: 'Tables Manager', icon: TableIcon },
                    { id: 'menu', label: 'Menu Settings', icon: MenuIcon },
                    { id: 'customers', label: 'Customers', icon: Users },
                    { id: 'employees', label: 'Employees', icon: UserCog },
                    { id: 'reports', label: 'Sales Reports', icon: FileText },
                    { id: 'settings', label: 'Global Settings', icon: SettingsIcon },
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button 
                        key={tab.id}
                        onClick={() => switchTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all w-full text-left ${activeTab === tab.id ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-bold">
                <button onClick={() => navigate(`/pos?restaurant=${restaurantId}`)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">POS Screen</button>
                <button onClick={handleLogout} className="px-3 py-2 bg-rose-500/10 text-rose-500 rounded-lg">Logout</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab View mounts */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
          
          {/* ==================== DASHBOARD TAB ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in print-hide">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Performance Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-1">Overview of today's activities and store metrics</p>
                </div>
                <button 
                  onClick={() => fetchDashboardData(restaurantId)} 
                  disabled={isSyncing}
                  className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/40 rounded-xl transition-all"
                >
                  <RefreshCw className={`w-4 h-4 text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* KPI Metric Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-5 rounded-3xl flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Sales</span>
                    <p className="text-2xl font-black">{settings.currency}{todaySalesVal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    <p className="text-[10px] text-emerald-500 font-bold">Aggregate complete volume</p>
                  </div>
                  <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Banknote className="w-6 h-6" /></div>
                </div>

                <div className="glass-card p-5 rounded-3xl flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Orders</span>
                    <p className="text-2xl font-black">{todayOrders.length}</p>
                    <p className="text-[10px] text-slate-500">Avg ticket: {settings.currency}{todayOrders.length > 0 ? (todaySalesVal / todayOrders.length).toFixed(0) : '0'}</p>
                  </div>
                  <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-2xl"><ShoppingCart className="w-6 h-6" /></div>
                </div>

                <div className="glass-card p-5 rounded-3xl flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tables</span>
                    <p className="text-2xl font-black">{tables.filter(t => t.status === 'Occupied').length} / {tables.length}</p>
                    <p className="text-[10px] text-amber-500 font-semibold">{tables.filter(t => t.status === 'Cleaning').length} in cleaning status</p>
                  </div>
                  <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl"><TableProperties className="w-6 h-6" /></div>
                </div>

                <div className="glass-card p-5 rounded-3xl flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Orders</span>
                    <p className="text-2xl font-black text-rose-500 animate-pulse">{pendingOrdersList.length}</p>
                    <p className="text-[10px] text-slate-400">Needs kitchen prep action</p>
                  </div>
                  <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl"><Flame className="w-6 h-6" /></div>
                </div>
              </div>

              {/* Simple graphical list representation (Sales charts) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-3xl lg:col-span-2 space-y-4 bg-white dark:bg-slate-900 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
                  <h3 className="font-extrabold text-base">Weekly Order Activities</h3>
                  <div className="space-y-3 pt-2">
                    {/* Render weekly aggregated values in a clean bar layout */}
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const heights = [40, 20, 60, 80, 50, 95, 75];
                      return (
                        <div key={day} className="flex items-center gap-4 text-xs font-semibold">
                          <span className="w-8 text-slate-400">{day}</span>
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${heights[i]}%` }}></div>
                          </div>
                          <span className="w-8 text-right text-slate-500">{heights[i]}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-3xl space-y-4 bg-white dark:bg-slate-900 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
                  <h3 className="font-extrabold text-base">Top Selling Categories</h3>
                  <div className="space-y-4.5 pt-2 text-xs font-bold text-slate-500">
                    {categories.map((cat, idx) => {
                      const pct = [55, 30, 10, 5];
                      return (
                        <div key={cat.id} className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            {cat.name}
                          </span>
                          <span>{pct[idx] || 5}% volume</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Orders & Top Selling Foods */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-3xl space-y-4 bg-white dark:bg-slate-900 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base">Recent Orders</h3>
                    <button onClick={() => switchTab('orders')} className="text-xs text-emerald-500 font-bold hover:underline">Manage All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                          <th className="pb-3">Order ID</th>
                          <th className="pb-3">Table</th>
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Total</th>
                          <th className="pb-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                            <td className="py-3 font-bold">{o.id}</td>
                            <td className="py-3 font-mono font-bold">Table {(o.tableId || '').replace('tab_','')}</td>
                            <td className="py-3">{o.customerName || 'Walk-In'}</td>
                            <td className="py-3 font-extrabold text-slate-800 dark:text-slate-150">{settings.currency}{o.grandTotal.toFixed(0)}</td>
                            <td className="py-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${o.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : o.status === 'Pending' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-3xl space-y-4 bg-white dark:bg-slate-900 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
                  <h3 className="font-extrabold text-base">Menu Items</h3>
                  <div className="space-y-4" id="dashboard-top-foods-list">
                    {foods.slice(0, 4).map(food => (
                      <div key={food.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={food.image} alt={food.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{food.name}</h4>
                            <p className="text-[10px] text-slate-400">{food.isVeg ? 'Veg' : 'Non-Veg'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black">{settings.currency}{food.price.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== LIVE ORDERS TAB ==================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in print-hide">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">Live Order Kanban</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage kitchen prep queues and invoice completion</p>
                </div>
                
                <button 
                  onClick={() => setIsKdsScreen(!isKdsScreen)} 
                  className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Monitor className="w-4 h-4" />
                  <span>{isKdsScreen ? 'Switch to Kanban Board' : 'Switch to KDS Screen'}</span>
                </button>
              </div>

              {!isKdsScreen ? (
                // Kanban View
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                  {['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'].filter(s => s !== 'Confirmed').map(status => {
                    const statusOrders = orders.filter(o => o.status === (status === 'Pending' ? 'Pending' : status));
                    let titleColor = 'bg-rose-500/10 border-b-rose-500 text-rose-600';
                    if (status === 'Preparing') titleColor = 'bg-amber-500/10 border-b-amber-500 text-amber-600';
                    if (status === 'Ready') titleColor = 'bg-emerald-500/10 border-b-emerald-500 text-emerald-600';
                    if (status === 'Completed') titleColor = 'bg-indigo-500/10 border-b-indigo-500 text-indigo-600';
                    if (status === 'Cancelled') titleColor = 'bg-slate-500/10 border-b-slate-500 text-slate-600';

                    return (
                      <div 
                        key={status} 
                        className="flex flex-col gap-4"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                      >
                        <div className={`flex items-center justify-between px-3 py-2 border-b-2 rounded-t-xl text-xs font-black ${titleColor}`}>
                          <span className="uppercase">{status} Queue</span>
                          <span className="bg-slate-800/10 dark:bg-white/10 rounded px-1.5 py-0.5 text-[10px]">{statusOrders.length}</span>
                        </div>
                        
                        <div className="flex-1 space-y-3 min-h-[400px] overflow-y-auto max-h-[70vh] bg-slate-100/50 dark:bg-slate-900/10 rounded-b-xl p-2 border border-slate-200/40 dark:border-slate-800/20">
                          {statusOrders.map(o => (
                            <div 
                              key={o.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, o.id)}
                              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-3 rounded-2xl hover:shadow-md cursor-grab active:cursor-grabbing transition-all space-y-2.5 text-xs"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-emerald-500">{o.id}</span>
                                <span className="font-black font-mono">T-{(o.tableId || '').replace('tab_','')}</span>
                              </div>

                              <div className="border-t border-b border-dashed border-slate-250 dark:border-slate-800 py-2 space-y-1">
                                {o.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between font-bold text-[10px] text-slate-555">
                                    <span>{it.quantity}x {it.name}</span>
                                    {it.instructions && <span className="text-[8px] italic text-amber-500">{it.instructions}</span>}
                                  </div>
                                ))}
                              </div>

                              {o.preparedBy && (
                                <p className="text-[9px] text-slate-400 font-bold">Cook: Chef {o.preparedBy}</p>
                              )}

                              <div className="flex justify-end gap-1.5 pt-1">
                                {status === 'Pending' && (
                                  <button onClick={() => updateOrderStatus(o.id, 'Preparing')} className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase">Accept</button>
                                )}
                                {status === 'Preparing' && (
                                  <button onClick={() => updateOrderStatus(o.id, 'Ready')} className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase">Cooked</button>
                                )}
                                {status === 'Ready' && (
                                  <button onClick={() => updateOrderStatus(o.id, 'Completed')} className="px-2.5 py-1 bg-indigo-500 text-white rounded-lg text-[9px] font-black uppercase">Deliver</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Kitchen Display Screen (KDS) View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').map(o => (
                    <div key={o.id} className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 relative flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                          <span className="font-extrabold text-slate-800 dark:text-slate-100">{o.id}</span>
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-950 font-black font-mono text-xs rounded-xl">
                            Table {(o.tableId || '').replace('tab_','')}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between font-bold text-xs">
                              <span className="text-slate-700 dark:text-slate-300">{it.quantity} x {it.name}</span>
                              {it.instructions && <span className="text-[10px] text-amber-500 font-bold">{it.instructions}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex gap-2">
                        {o.status === 'Pending' ? (
                          <button onClick={() => updateOrderStatus(o.id, 'Preparing')} className="flex-1 py-2 bg-amber-500 text-white text-xs font-black rounded-xl">Accept Ticket</button>
                        ) : (
                          <button onClick={() => updateOrderStatus(o.id, 'Ready')} className="flex-1 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl">Mark Ready</button>
                        )}
                        <button onClick={() => updateOrderStatus(o.id, 'Cancelled')} className="px-3 py-2 bg-rose-500/10 text-rose-500 text-xs font-black rounded-xl">Cancel</button>
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-400">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                      <p className="font-bold">No active orders in kitchen queue.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== TABLES MANAGEMENT TAB ==================== */}
          {activeTab === 'tables' && (
            <div className="space-y-6 animate-fade-in print-hide">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Restaurant Tables & QR Settings</h2>
                  <p className="text-xs text-slate-400 mt-1">Generate print sheet QR flyers and set physical room statuses</p>
                </div>
                
                {/* Form to quick add table */}
                <form onSubmit={handleCreateTable} className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    required
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Table Name (e.g. Table 6)" 
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                  <input 
                    type="number" 
                    required
                    value={newTableCap}
                    onChange={(e) => setNewTableCap(e.target.value)}
                    min="1"
                    className="w-16 p-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                  <button type="submit" className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Table
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="font-extrabold text-base">Active Floor Plan</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 text-center">
                    {tables.map(t => {
                      let bg = 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-555';
                      if (t.status === 'Occupied') bg = 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-555';
                      if (t.status === 'Reserved') bg = 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-555';
                      if (t.status === 'Cleaning') bg = 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 text-amber-555';

                      return (
                        <div 
                          key={t.id}
                          className={`p-4 border-2 rounded-3xl flex flex-col justify-between gap-3 relative ${bg}`}
                        >
                          <div>
                            <span className="block text-[10px] font-black uppercase text-slate-400">Cap: {t.capacity} Seater</span>
                            <h4 className="font-black text-sm mt-1">{t.name}</h4>
                            <span className="text-[9px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block bg-slate-100 dark:bg-slate-950/80">{t.status}</span>
                          </div>
                          
                          <div className="flex gap-1.5 justify-center border-t border-slate-200/20 pt-2 text-[9px] font-bold">
                            <select 
                              value={t.status}
                              onChange={(e) => handleTableStatusRelease(t.id, e.target.value)}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-[9px] font-black focus:outline-none cursor-pointer text-slate-800 dark:text-slate-100"
                            >
                              <option value="Available">Available</option>
                              <option value="Occupied">Occupied</option>
                              <option value="Reserved">Reserved</option>
                              <option value="Cleaning">Cleaning</option>
                            </select>
                            <button 
                              onClick={() => setActiveQRTable(t.id)}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-900 hover:bg-emerald-500 hover:text-white rounded-lg text-emerald-500"
                            >
                              QR Poster
                            </button>
                            <button onClick={() => handleDeleteTable(t.id)} className="p-1 hover:text-rose-500 text-slate-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* QR FLYER DISPLAY */}
                <div className="lg:col-span-4 glass-card p-6 rounded-3xl space-y-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
                  <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">QR Code Poster Tool</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Generate high quality flyer cards for table tents</p>
                  </div>
                  
                  {tables.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Select Table Target</label>
                        <select 
                          value={activeQRTable}
                          onChange={(e) => setActiveQRTable(e.target.value)}
                          className="w-full p-3 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100"
                        >
                          {tables.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 bg-slate-50 dark:bg-slate-950" id="qr-poster-element">
                        <h4 className="font-black text-lg tracking-wider">
                          {(tables.find(t => t.id === activeQRTable)?.name || 'Table').toUpperCase()}
                        </h4>
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
                          <img src={getQRPosterUrl()} alt="Table QR Flyer" className="w-36 h-36" />
                        </div>
                        <div className="text-center space-y-1 text-slate-500">
                          <p className="text-[10px] font-bold">SCAN TO PLACE AN ORDER</p>
                          <p className="text-[8px] italic">Powered by {settings.restaurantName || 'QuickQR'}</p>
                        </div>
                      </div>

                      <a 
                        href={getQRPosterUrl()}
                        download={`qr_table_${activeQRTable}.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-2xl text-xs flex justify-center items-center gap-1.5 transition-all text-center"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download QR Image</span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center">Add tables first to print QR cards.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== MENU MANAGEMENT TAB ==================== */}
          {activeTab === 'menu' && (
            <div className="space-y-6 animate-fade-in print-hide">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Food Menu Management</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure categories and update items with price/image tags</p>
                </div>
                <button 
                  onClick={() => openFoodEditModal(null)} 
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl flex items-center gap-1.5 shadow-md text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Menu Item</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Category CMS Manager Panel */}
                <div className="lg:col-span-4 glass-card p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 space-y-5">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <span>Menu Categories CMS</span>
                    </h3>
                    <p className="text-[9px] text-slate-400 mt-0.5">Add or delete category headers</p>
                  </div>

                  <form onSubmit={handleCreateCategory} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">New Category Title</label>
                      <input 
                        type="text" 
                        required 
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="E.g. Shakes & Lassis"
                        className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Icon Style</label>
                      <select 
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100"
                      >
                        <option value="utensils">Plate & Spoon (utensils)</option>
                        <option value="soup">Soup Bowl (soup)</option>
                        <option value="pizza">Pizza Card (pizza)</option>
                        <option value="coffee">Coffee Cup (coffee)</option>
                        <option value="ice-cream">Ice Cream (ice-cream)</option>
                        <option value="leaf">Health Herb (leaf)</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-xs active:scale-95 transition-all">
                      Create Category
                    </button>
                  </form>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Existing Categories</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {categories.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center text-xs p-2 bg-slate-100/50 dark:bg-slate-950/40 rounded-xl">
                          <span className="font-bold">{cat.name} ({cat.icon})</span>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-rose-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Food items rows list */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="glass-card p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                    <div className="relative max-w-xs w-full">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                        <Search className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        placeholder="Search dish..." 
                        className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-950 border-none rounded-xl focus:outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                        value={menuFilterCat}
                        onChange={(e) => setMenuFilterCat(e.target.value)}
                        className="p-2 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-100"
                      >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500">
                            <th className="p-4">Dish</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Availability</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                          {filteredFoodsCms.map(food => {
                            const catObj = categories.find(c => c.id === food.categoryId);
                            return (
                              <tr key={food.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                                <td className="p-4 flex items-center gap-3">
                                  <img src={food.image} alt={food.name} className="w-9 h-9 rounded-lg object-cover" />
                                  <span className="font-bold">{food.name}</span>
                                </td>
                                <td className="p-4 font-semibold text-slate-500">{catObj ? catObj.name : 'Unknown'}</td>
                                <td className="p-4 font-black">{settings.currency}{food.price.toFixed(2)}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${food.isVeg ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {food.isVeg ? 'Veg' : 'Non-Veg'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${food.isAvailable ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                    {food.isAvailable ? 'In Stock' : 'Out'}
                                  </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                  <button onClick={() => openFoodEditModal(food)} className="p-1 hover:text-emerald-500 inline-block"><Edit className="w-4.5 h-4.5" /></button>
                                  <button onClick={() => handleDeleteFood(food.id)} className="p-1 hover:text-rose-500 inline-block"><Trash2 className="w-4.5 h-4.5" /></button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== CUSTOMERS TAB ==================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in print-hide">
              <div>
                <h2 className="text-2xl font-black">Customer Loyalty Registry</h2>
                <p className="text-xs text-slate-400 mt-1">Track guest spending behaviors and order statistics</p>
              </div>

              <div className="glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="relative max-w-xs w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={custSearch}
                      onChange={(e) => setCustSearch(e.target.value)}
                      placeholder="Search customer name or phone..." 
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-950 border-none rounded-xl focus:outline-none text-slate-800 dark:text-slate-100" 
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500">
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Orders Count</th>
                        <th className="p-4">Total Spending</th>
                        <th className="p-4">Favorite Dishes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {filteredCustomersCms.map(cust => (
                        <tr key={cust.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-950 text-emerald-500 font-bold flex items-center justify-center text-xs">
                              {cust.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-extrabold">{cust.name}</h4>
                              <p className="text-[9px] text-slate-400 mt-0.5">+91 {cust.phone}</p>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-500">{cust.ordersCount}</td>
                          <td className="p-4 font-black">{settings.currency}{cust.totalSpend.toFixed(2)}</td>
                          <td className="p-4 font-semibold text-emerald-555">{cust.favItem || 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== EMPLOYEES TAB ==================== */}
          {activeTab === 'employees' && (
            <div className="space-y-6 animate-fade-in print-hide">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Staff Profiles</h2>
                  <p className="text-xs text-slate-400 mt-1">Register system staff accounts and operational roles</p>
                </div>
                <button 
                  onClick={() => openEmployeeModal(null)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl flex items-center gap-1.5 shadow-md text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Employee</span>
                </button>
              </div>

              <div className="glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500">
                        <th className="p-4">Staff Member</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Account Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                          <td className="p-4 flex items-center gap-3">
                            <img src={emp.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-extrabold">{emp.name}</span>
                          </td>
                          <td className="p-4 font-bold text-slate-500">{emp.email}</td>
                          <td className="p-4 font-mono">{emp.contact || 'N/A'}</td>
                          <td className="p-4 font-bold text-slate-500">{emp.role}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => openEmployeeModal(emp)} className="p-1 hover:text-emerald-500 inline-block"><Edit className="w-4.5 h-4.5" /></button>
                            <button onClick={() => handleDeleteEmployee(emp.id)} className="p-1 hover:text-rose-500 inline-block"><Trash2 className="w-4.5 h-4.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== REPORTS TAB ==================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fade-in print-hide">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">Financial Sales Reports</h2>
                  <p className="text-xs text-slate-400 mt-1">Export transaction logs and analyze GST tax deductions</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-xs flex items-center gap-1">
                    <Printer className="w-4.5 h-4.5" />
                    <span>Print Report</span>
                  </button>
                </div>
              </div>

              <div className="glass-card p-4 rounded-3xl flex flex-wrap items-center gap-4 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                <button onClick={() => setReportPeriod('today')} className={`px-4 py-2 rounded-xl transition-all ${reportPeriod === 'today' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-500'}`}>Today</button>
                <button onClick={() => setReportPeriod('week')} className={`px-4 py-2 rounded-xl transition-all ${reportPeriod === 'week' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-500'}`}>7 Days</button>
                <button onClick={() => setReportPeriod('month')} className={`px-4 py-2 rounded-xl transition-all ${reportPeriod === 'month' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-500'}`}>30 Days</button>
                <button onClick={() => setReportPeriod('custom')} className={`px-4 py-2 rounded-xl transition-all ${reportPeriod === 'custom' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-500'}`}>Custom</button>
                
                {reportPeriod === 'custom' && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span>Range:</span>
                    <input type="date" value={reportStart} onChange={(e) => setReportStart(e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-950 rounded-lg focus:outline-none text-slate-800 dark:text-slate-100" />
                    <span>to</span>
                    <input type="date" value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-950 rounded-lg focus:outline-none text-slate-800 dark:text-slate-100" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-card p-5 rounded-3xl text-center bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                  <span className="text-xs text-slate-400">Total Net Sales</span>
                  <p className="text-2xl font-black text-emerald-500 mt-1">{settings.currency}{reportNetSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-card p-5 rounded-3xl text-center bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                  <span className="text-xs text-slate-400">Total GST Captured</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{settings.currency}{reportTaxSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-card p-5 rounded-3xl text-center bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                  <span className="text-xs text-slate-400">Orders Finished Count</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{reportOrders.length}</p>
                </div>
              </div>

              <div className="glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500">
                        <th className="p-4">Date/Time</th>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Subtotal</th>
                        <th className="p-4">GST (5%)</th>
                        <th className="p-4">Service</th>
                        <th className="p-4">Grand Total</th>
                        <th className="p-4">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {reportOrders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                          <td className="p-4">{new Date(o.createdAt).toLocaleString()}</td>
                          <td className="p-4 font-bold text-slate-500">{o.id}</td>
                          <td className="p-4">{settings.currency}{o.subtotal.toFixed(2)}</td>
                          <td className="p-4">{settings.currency}{o.tax.toFixed(2)}</td>
                          <td className="p-4">{settings.currency}{o.serviceCharge.toFixed(2)}</td>
                          <td className="p-4 font-black">{settings.currency}{o.grandTotal.toFixed(2)}</td>
                          <td className="p-4">{o.paymentMethod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SETTINGS TAB ==================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in print-hide">
              <div>
                <h2 className="text-2xl font-black">Global Store Configuration</h2>
                <p className="text-xs text-slate-400 mt-1">Configure restaurant tax codes, currency, operating hours, and active theme</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start max-w-6xl">
                
                {/* Core Settings Form */}
                <form onSubmit={handleSettingsSubmit} className="glass-card p-6 sm:p-8 rounded-3xl space-y-8 lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                  {/* Restaurant Info */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">1. Restaurant Identity</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Restaurant Name</label>
                        <input type="text" value={setRestName} onChange={(e) => setSetRestName(e.target.value)} required className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Store Logo URL</label>
                        <input type="text" value={setRestLogo} onChange={(e) => setSetRestLogo(e.target.value)} required className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Store Address</label>
                        <input type="text" value={setAddress} onChange={(e) => setSetAddress(e.target.value)} required className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Phone</label>
                        <input type="tel" value={setPhone} onChange={(e) => setSetPhone(e.target.value)} required className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Email</label>
                        <input type="email" value={setEmail} onChange={(e) => setSetEmail(e.target.value)} required className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                      </div>
                    </div>
                  </div>

                  {/* GST Rates */}
                  <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">2. Taxes & Rates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Currency Symbol</label>
                        <input type="text" value={setCurrency} onChange={(e) => setSetCurrency(e.target.value)} required className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Tax Code (GST) %</label>
                        <input type="number" value={setTax} onChange={(e) => setSetTax(e.target.value)} required min="0" max="100" className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Service Surcharge %</label>
                        <input type="number" value={setService} onChange={(e) => setSetService(e.target.value)} required min="0" max="100" className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                      </div>
                    </div>
                  </div>

                  {/* Operating timings */}
                  <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">3. Operational Timing</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Opening Hour (HH:MM)</label>
                        <input type="time" value={setOpenTime} onChange={(e) => setSetOpenTime(e.target.value)} required className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Closing Hour (HH:MM)</label>
                        <input type="time" value={setCloseTime} onChange={(e) => setSetCloseTime(e.target.value)} required className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                      </div>
                    </div>
                  </div>

                  {/* Receipts footer */}
                  <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h3 class="font-extrabold text-sm uppercase tracking-wider text-slate-400">4. Layout and Receipts</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Store UI Theme</label>
                        <select value={setThemeMode} onChange={(e) => setSetThemeMode(e.target.value)} className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100">
                          <option value="light">Light Mode Theme</option>
                          <option value="dark">Dark Mode Theme</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Default Invoice Footer</label>
                        <textarea value={setInvoiceFooter} onChange={(e) => setSetInvoiceFooter(e.target.value)} rows="2" className="w-full p-3 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none resize-none text-slate-800 dark:text-slate-100"></textarea>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-450 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-center">
                    Save Global Store Configuration
                  </button>
                </form>

                {/* JSON BACKUP MANAGER PANEL */}
                <div className="glass-card p-6 rounded-3xl space-y-6 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                  <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <Database className="w-5 h-5 text-emerald-500" />
                      <span>Database Backup (JSON)</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Export or Import all configurations offline as JSON</p>
                  </div>

                  <div className="space-y-4 text-xs font-semibold">
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-slate-500 leading-relaxed">
                      All changes made to menu items, categories, employees, and tables are saved in MongoDB. Use these tools to back up your data configuration as a JSON file.
                    </div>

                    <button onClick={exportJSONDatabase} type="button" className="w-full py-3 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all">
                      <Download className="w-4 h-4" />
                      <span>Export Data to JSON</span>
                    </button>

                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
                      <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Restore Database from JSON</label>
                      <input type="file" id="import-json-file" accept=".json" className="hidden" onChange={handleJSONDatabaseImport} />
                      <button onClick={() => document.getElementById('import-json-file').click()} type="button" className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-555/20 border border-emerald-500/20 text-emerald-500 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all">
                        <Upload className="w-4 h-4" />
                        <span>Restore Data from JSON</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* 1. Food Edit Modal */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print-hide">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-[30px] p-6 shadow-2xl animate-slide-up relative">
            <button onClick={() => setIsFoodModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-lg mb-4">{selectedFood ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
            <form onSubmit={handleFoodSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Dish Name *</label>
                <input type="text" required value={foodName} onChange={(e) => setFoodName(e.target.value)} placeholder="E.g. Butter Chicken" className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Price ({settings.currency}) *</label>
                  <input type="number" required value={foodPrice} onChange={(e) => setFoodPrice(e.target.value)} placeholder="E.g. 299" className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category *</label>
                  <select value={foodCat} onChange={(e) => setFoodCat(e.target.value)} required className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Image URL</label>
                <input type="text" value={foodImage} onChange={(e) => setFoodImage(e.target.value)} placeholder="https://unsplash.com/..." className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <textarea value={foodDesc} onChange={(e) => setFoodDesc(e.target.value)} rows="2" placeholder="Brief description of dish..." className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none resize-none text-slate-800 dark:text-slate-100"></textarea>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                  <input type="checkbox" checked={foodVeg} onChange={(e) => setFoodVeg(e.target.checked)} className="rounded text-emerald-500 accent-emerald-500" />
                  <span>Is Vegetarian</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                  <input type="checkbox" checked={foodAvail} onChange={(e) => setFoodAvail(e.target.checked)} className="rounded text-emerald-500 accent-emerald-500" />
                  <span>In Stock Available</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                  <input type="checkbox" checked={foodSpecial} onChange={(e) => setFoodSpecial(e.target.checked)} className="rounded text-emerald-500 accent-emerald-500" />
                  <span>Chef's Special</span>
                </label>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md text-xs">Save Menu Item</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Employee Register/Edit Modal */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print-hide">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-[30px] p-6 shadow-2xl animate-slide-up relative">
            <button onClick={() => setIsEmpModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-lg mb-4">{selectedEmp ? 'Edit Staff Profile' : 'Register Staff Account'}</h3>
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
                <input type="text" required value={empName} onChange={(e) => setEmpName(e.target.value)} placeholder="Ramesh Prasad" className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Staff Email ID *</label>
                <input type="email" required disabled={!!selectedEmp} value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} placeholder="ramesh@swad.com" className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none disabled:opacity-60 text-slate-800 dark:text-slate-100" />
              </div>
              {!selectedEmp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Staff Login Password *</label>
                  <input 
                    type="password" 
                    required 
                    value={empPassword} 
                    onChange={(e) => setEmpPassword(e.target.value)} 
                    placeholder="Set login password (min 6 characters)" 
                    minLength={6}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" 
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Number</label>
                  <input type="tel" value={empPhone} onChange={(e) => setEmpPhone(e.target.value)} placeholder="9876543210" className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Role *</label>
                  <select value={empRole} onChange={(e) => setEmpRole(e.target.value)} className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100">
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Chef">Chef</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Profile Photo URL</label>
                  <input type="text" value={empImage} onChange={(e) => setEmpImage(e.target.value)} placeholder="https://unsplash.com/..." className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Account Status *</label>
                  <select value={empStatus} onChange={(e) => setEmpStatus(e.target.value)} className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100">
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md text-xs">Save Staff Member</button>
            </form>
          </div>
        </div>
      )}

      {/* Hidden print layout window for Weekly Financial Sales Report */}
      <div id="printable-receipt" className="hidden bg-white text-slate-900 p-8 w-full max-w-[210mm] mx-auto text-xs space-y-6">
        <div className="text-center pb-4 border-b border-dashed space-y-1">
          <h2 className="font-extrabold text-xl uppercase">{settings.restaurantName} - SALES STATEMENT</h2>
          <p className="text-[10px] text-slate-400">Statement Range: {reportPeriod.toUpperCase()}</p>
          <p className="text-[10px] text-slate-400">Date Compiled: {new Date().toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-3 gap-6 text-center text-xs border-b pb-6 border-dashed">
          <div><span className="block text-slate-400">Net Sales Volume:</span> <strong>{settings.currency}{reportNetSales.toFixed(2)}</strong></div>
          <div><span className="block text-slate-400">GST Collected:</span> <strong>{settings.currency}{reportTaxSum.toFixed(2)}</strong></div>
          <div><span className="block text-slate-400">Orders Audited:</span> <strong>{reportOrders.length} Completed</strong></div>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Individual Audit Invoices</h4>
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="border-b font-bold text-slate-500">
                <th className="pb-2">Audited At</th>
                <th className="pb-2">Bill No</th>
                <th className="pb-2">Subtotal</th>
                <th className="pb-2">Taxes</th>
                <th className="pb-2">Service</th>
                <th className="pb-2">Grand Total</th>
                <th className="pb-2">Method</th>
              </tr>
            </thead>
            <tbody>
              {reportOrders.map(o => (
                <tr key={o.id} className="border-b">
                  <td className="py-2">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="py-2 font-bold">{o.id}</td>
                  <td className="py-2">{settings.currency}{o.subtotal.toFixed(0)}</td>
                  <td className="py-2">{settings.currency}{o.tax.toFixed(0)}</td>
                  <td className="py-2">{settings.currency}{o.serviceCharge.toFixed(0)}</td>
                  <td className="py-2 font-bold">{settings.currency}{o.grandTotal.toFixed(0)}</td>
                  <td className="py-2">{o.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
