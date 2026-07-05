import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ShieldAlert, Moon, Sun, RefreshCw, Store, 
  Banknote, ShoppingCart, Activity, Plus, X, 
  Database, Download, Upload, CheckCircle, AlertCircle 
} from 'lucide-react';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [toast, setToast] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form Fields
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPlan, setRegPlan] = useState('Pro');

  useEffect(() => {
    // 1. Session verification
    const session = JSON.parse(localStorage.getItem('qr_rest_session'));
    if (!session || session.role !== 'SuperAdmin') {
      navigate(`/super-admin/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    document.documentElement.classList.add('dark');
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setIsSyncing(true);
    try {
      const res = await api.get('/restaurants');
      setRestaurants(res.data);
      showToast('Dashboard metrics refreshed');
    } catch (err) {
      showToast('Failed to load outlet details', 'error');
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('qr_rest_session');
    navigate('/super-admin/login');
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

  const toggleRestaurantState = async (restId, currentStatus) => {
    const targetStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.put(`/restaurants/${restId}/status`, { status: targetStatus });
      showToast(`Outlet set to ${targetStatus}`, targetStatus === 'Active' ? 'success' : 'error');
      fetchDashboard();
    } catch (err) {
      showToast('Failed to update restaurant status', 'error');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!/^[a-z0-9_]+$/.test(regId)) {
      showToast('Slug can only contain lowercase letters, numbers, and underscores.', 'error');
      return;
    }

    if (restaurants.find(r => r.id === regId)) {
      showToast('This URL Slug subdomain is already taken.', 'error');
      return;
    }

    try {
      await api.post('/restaurants', {
        id: regId,
        name: regName,
        email: regEmail,
        phone: regPhone,
        plan: regPlan
      });

      showToast(`Registered successfully!`, 'success');
      setIsRegisterOpen(false);
      setRegName('');
      setRegId('');
      setRegEmail('');
      setRegPhone('');
      fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register brand.', 'error');
    }
  };

  // BACKUPS
  const downloadGlobalBackup = async () => {
    try {
      const res = await api.get('/backup/export');
      const backupString = JSON.stringify(res.data, null, 2);
      const blob = new Blob([backupString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quickqr_platform_global_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Platform global database backup exported!");
    } catch (err) {
      showToast('Failed to compile database export', 'error');
    }
  };

  const handleGlobalImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const payload = JSON.parse(e.target.result);
        const res = await api.post('/backup/restore', payload);
        if (res.data.success) {
          showToast("Global database cluster restored successfully!");
          fetchDashboard();
        } else {
          showToast(res.data.message, "error");
        }
      } catch (err) {
        showToast("Invalid JSON backup structure.", "error");
      }
    };
    reader.readAsText(file);
  };

  // Metrics
  const totalOutlets = restaurants.length;
  const aggregateSales = restaurants.reduce((sum, r) => sum + (r.salesVolume || 0), 0);
  const totalTxCount = restaurants.reduce((sum, r) => sum + (r.ordersCount || 0), 0);

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-300 font-sans flex flex-col">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg border border-white/10 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white animate-slide-up`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Super Admin Navigation Header */}
      <header className="sticky top-0 z-45 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-left leading-none">
              <span className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white">QuickQR SAAS</span>
              <p className="text-[9px] font-bold text-slate-400">Global Admin Console</p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <button onClick={handleLogout} className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 font-black rounded-xl text-xs transition-all active:scale-95">
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* Main Console Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1 w-full animate-fade-in">
        
        {/* Title Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Platform Dashboard</h1>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold mt-1">Manage global multi-tenant restaurants, view sales statistics, and configure backups</p>
          </div>
          <button 
            onClick={fetchDashboard} 
            disabled={isSyncing}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-xl text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Platform metrics summary boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="glass-card p-5 rounded-3xl flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Outlets</span>
              <p className="text-2xl font-black">{totalOutlets}</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl"><Store className="w-5 h-5" /></div>
          </div>
          <div className="glass-card p-5 rounded-3xl flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Aggregate Sales Volume</span>
              <p className="text-2xl font-black text-emerald-500">
                ₹{aggregateSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl"><Banknote className="w-5 h-5" /></div>
          </div>
          <div className="glass-card p-5 rounded-3xl flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Transactions</span>
              <p className="text-2xl font-black">{totalTxCount}</p>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl"><ShoppingCart className="w-5 h-5" /></div>
          </div>
          <div className="glass-card p-5 rounded-3xl flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Platform Health</span>
              <p className="text-2xl font-black text-emerald-500">100% Online</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl"><Activity className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left registry table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card rounded-[30px] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-extrabold text-sm uppercase tracking-wider">Tenants Register Database</h3>
                <button 
                  onClick={() => setIsRegisterOpen(true)} 
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Outlet
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500">
                      <th className="p-4">Restaurant Brand</th>
                      <th className="p-4">Slug ID</th>
                      <th className="p-4">Plan Selected</th>
                      <th className="p-4">Sales Vol.</th>
                      <th class="p-4">Status</th>
                      <th className="p-4 text-right">Scope Panel Redirect Links</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {restaurants.map(r => {
                      const isSuspended = r.status === 'Suspended';
                      return (
                        <tr key={r.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold font-mono">
                              {r.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-800 dark:text-slate-200">{r.name}</h4>
                              <p className="text-[9px] text-slate-400 mt-0.5">{r.email || 'None'}</p>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-[10px] text-slate-500">{r.id}</td>
                          <td className="p-4"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 font-bold">{r.plan}</span></td>
                          <td className="p-4 font-black text-slate-800 dark:text-slate-100">
                            ₹{(r.salesVolume || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${isSuspended ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button 
                              onClick={() => toggleRestaurantState(r.id, r.status)} 
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${isSuspended ? 'bg-emerald-500 text-white' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'}`}
                            >
                              {isSuspended ? 'Reactivate' : 'Suspend'}
                            </button>
                            <a href={`/admin?restaurant=${r.id}`} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-555 hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold inline-block transition-all">Admin</a>
                            <a href={`/pos?restaurant=${r.id}`} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500 hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold inline-block transition-all">POS</a>
                            <a href={`/customer?restaurant=${r.id}&table=3`} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold inline-block transition-all">QR Menu</a>
                          </td>
                        </tr>
                      );
                    })}
                    {restaurants.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">
                          No outlets registered on this network yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Backup & Restore manager */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 rounded-[30px] space-y-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40">
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Database className="w-5 h-5 text-emerald-500" />
                  <span>Global Database Sync</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Export or Restore the complete multi-tenant cluster state</p>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-slate-500 leading-relaxed text-[11px]">
                  This utility compiles and packages data directories for **all** outlets in MongoDB into a single unified JSON backup document.
                </div>

                <button 
                  onClick={downloadGlobalBackup} 
                  type="button" 
                  className="w-full py-3.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Global JSON Backup</span>
                </button>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Restore entire cluster from JSON</label>
                  <input 
                    type="file" 
                    id="import-json-file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleGlobalImport} 
                  />
                  <button 
                    onClick={() => document.getElementById('import-json-file').click()} 
                    type="button" 
                    className="w-full py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Restore Global JSON Backup</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-[30px] p-6 shadow-2xl animate-slide-up relative">
            <button onClick={closeRegisterModal} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-xl mb-1">Register Restaurant</h3>
            <p className="text-[11px] text-slate-400 mb-4">Start your contactless table QR menu POS instantly</p>
            
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Restaurant Name *</label>
                <input 
                  type="text" 
                  required 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="E.g. Delhi Durbar"
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tenant URL Slug *</label>
                <input 
                  type="text" 
                  required 
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder="E.g. delhi_durbar (only lowercase & underscores)" 
                  pattern="^[a-z0-9_]+$"
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Owner Email *</label>
                  <input 
                    type="email" 
                    required 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="owner@delhi.com"
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mobile Phone *</label>
                  <input 
                    type="tel" 
                    required 
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="9876543210" 
                    pattern="^[6-9]\d{9}$" 
                    maxLength={10}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" 
                    title="10 digit mobile starting with 6-9."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Subscription Plan *</label>
                <select 
                  value={regPlan}
                  onChange={(e) => setRegPlan(e.target.value)}
                  required 
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none text-slate-800 dark:text-slate-100"
                >
                  <option value="Starter">Starter Plan (₹999/mo)</option>
                  <option value="Pro">Pro Plan (₹2,499/mo)</option>
                  <option value="Enterprise">Enterprise Plan (Custom)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-all">
                Create & Launch Tenant
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
