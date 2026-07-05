import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Layers, Moon, Sun, Sparkles, PlusCircle, 
  Shield, Store, Banknote, QrCode, Monitor, 
  CookingPot, Check, X, CheckCircle, AlertCircle 
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [toast, setToast] = useState(null);

  // Form Fields
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPlan, setRegPlan] = useState('Pro');
  const [regPassword, setRegPassword] = useState('');
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [loginSlug, setLoginSlug] = useState('');

  useEffect(() => {
    fetchRestaurants();
    // Sync dark mode setting
    document.documentElement.classList.add('dark');
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get('/restaurants');
      setRestaurants(res.data);
    } catch (err) {
      showToast('Error loading platform metrics', 'error');
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

  const openRegisterModal = (plan = 'Pro') => {
    setRegPlan(plan);
    setIsRegisterOpen(true);
  };

  const closeRegisterModal = () => {
    setIsRegisterOpen(false);
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
        plan: regPlan,
        password: regPassword
      });

      showToast(`${regName} registered! Launching control panel...`, 'success');
      setIsRegisterOpen(false);
      setRegName('');
      setRegId('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');

      setTimeout(() => {
        navigate(`/admin?restaurant=${regId}`);
      }, 1500);

    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register brand.', 'error');
    }
  };

  // Compute Stats
  const activeCount = restaurants.length;
  const aggregateSales = restaurants.reduce((sum, r) => sum + (r.salesVolume || 0), 0);

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-300 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg border border-white/10 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white animate-slide-up`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-900/40 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-left leading-none">
              <span className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white">QuickQR SAAS</span>
              <p className="text-[9px] font-bold text-slate-400">Multi-Outlet Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-500">
            <a href="#features" className="hover:text-emerald-500 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing Plans</a>
            <span onClick={() => setIsLoginPromptOpen(true)} className="hover:text-emerald-500 transition-colors cursor-pointer">Merchant Login</span>
            <span onClick={() => navigate('/super-admin')} className="hover:text-emerald-500 transition-colors cursor-pointer">Super Admin Portal</span>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all">
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <button onClick={() => openRegisterModal('Pro')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-sm text-xs transition-all active:scale-95">
              Register Restaurant
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent py-20 sm:py-24 border-b border-slate-100 dark:border-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Details */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Multi-Restaurant QR Ordering & POS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Run Multiple Restaurants <br />
              <span className="bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent">On One Scoped Network</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold">
              Enable independent diners, cafes, and tandoors to sign up instantly, compile custom menus, allocate tables, run POS registers, and dispatch orders to KDS displays—all cleanly isolated in MongoDB.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button onClick={() => openRegisterModal('Pro')} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 hover:translate-y-[-2px] text-sm">
                <span>Register Your Brand</span>
                <PlusCircle className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/super-admin')} className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-sm">
                <span>Explore Super Admin</span>
                <Shield className="w-4.5 h-4.5 text-emerald-500" />
              </button>
            </div>
          </div>

          {/* Hero stats details */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Floating details tags */}
            <div className="absolute -top-4 -left-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-soft z-20">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl"><Store className="w-5 h-5" /></div>
              <div>
                <span className="block text-[10px] font-black uppercase text-slate-400">Total Tenants</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{activeCount} Registered</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-soft z-20" style={{ animationDelay: '1.5s' }}>
              <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl"><Banknote className="w-5 h-5" /></div>
              <div>
                <span className="block text-[10px] font-black uppercase text-slate-400">Total Volume</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                  ₹{aggregateSales.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 rotate-3 transition-transform hover:rotate-0 duration-300">
              <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80" alt="Restaurant Interior" className="w-full h-full object-cover" />
            </div>
          </div>

        </div>
      </section>

      {/* Platform Features */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tight">Everything You Need to Scale</h2>
          <p className="text-slate-400 font-semibold text-sm">Empower your stores with robust tools that manage dining, billing, and cooking in full isolation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[30px] border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit"><QrCode className="w-6 h-6" /></div>
            <h3 class="font-extrabold text-lg">Contactless QR Menu</h3>
            <p className="text-slate-450 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              Allow diners to scan table QR codes, browse categorized menus, choose cooking styles, submit orders, and track preparation stages.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[30px] border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl w-fit"><Monitor className="w-6 h-6" /></div>
            <h3 class="font-extrabold text-lg">Staff POS Register</h3>
            <p className="text-slate-450 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              Take phone/walk-in reservations, assign servers, print physical thermal receipts, split taxes, and clear tables from a clean dashboard.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[30px] border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-4">
            <div className="p-3 bg-violet-500/10 text-violet-500 rounded-2xl w-fit"><CookingPot className="w-6 h-6" /></div>
            <h3 class="font-extrabold text-lg">Live KDS Display</h3>
            <p className="text-slate-450 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              Stream incoming tickets directly to tablet screens. Mark cooking times, allocate chefs, and send alerts instantly when meals are ready.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing section */}
      <section id="pricing" className="bg-slate-100/50 dark:bg-slate-900/10 py-20 border-y border-slate-150 dark:border-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tight">Flexible Pricing Plans</h2>
            <p className="text-slate-400 font-semibold text-sm">Select the perfect subscription tier for your restaurant franchise model.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Starter */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[30px] border border-slate-200/50 dark:border-slate-800/40 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">₹999</span>
                  <span className="text-slate-400 text-xs font-bold">/ month</span>
                </div>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">For small cafes, sweet shops, or standalone food trucks starting out.</p>
                <ul className="text-[10px] space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Up to 5 dining tables</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Basic POS terminal & KDS</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Standard PDF receipts</li>
                </ul>
              </div>
              <button onClick={() => openRegisterModal('Starter')} className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white font-bold rounded-xl text-xs transition-all">Choose Starter</button>
            </div>

            {/* Pro */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[30px] border-2 border-emerald-500 relative flex flex-col justify-between space-y-6 shadow-md">
              <div className="absolute -top-3 right-8 px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase">Most Popular</div>
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">Pro</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">₹2,499</span>
                  <span className="text-slate-400 text-xs font-bold">/ month</span>
                </div>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">For fine-dining spots, busy tandoors, and cafes needing complete staff workflows.</p>
                <ul className="text-[10px] space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Up to 25 dining tables</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Live Chef allocation & Stepper status</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Custom logo settings & prints</li>
                </ul>
              </div>
              <button onClick={() => openRegisterModal('Pro')} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all">Choose Pro</button>
            </div>

            {/* Enterprise */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[30px] border border-slate-200/50 dark:border-slate-800/40 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">Enterprise</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">Custom</span>
                </div>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">For major multi-outlet restaurant chains or franchises.</p>
                <ul className="text-[10px] space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Unlimited dining tables</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Multi-terminal staff allocation</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Custom system integrations & APIs</li>
                </ul>
              </div>
              <button onClick={() => openRegisterModal('Enterprise')} className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white font-bold rounded-xl text-xs transition-all">Contact Enterprise Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Modals */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-[30px] p-6 shadow-2xl animate-slide-up relative">
            <button onClick={closeRegisterModal} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-xl mb-1 text-slate-900 dark:text-white">Register Restaurant</h3>
            <p className="text-[11px] text-slate-400 mb-4 font-semibold">Create your restaurant account and manage menus instantly</p>
            
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
                <label className="block text-xs font-semibold text-slate-400 mb-1">Owner Admin Password *</label>
                <input 
                  type="password" 
                  required 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Set login password (min 6 characters)" 
                  minLength={6}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Subscription Tier Plan *</label>
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

      {/* Merchant Login Prompt Modal */}
      {isLoginPromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-[30px] p-6 shadow-2xl animate-slide-up relative">
            <button onClick={() => setIsLoginPromptOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-xl mb-1 text-slate-900 dark:text-white">Merchant Login</h3>
            <p className="text-[11px] text-slate-405 mb-4 font-semibold">Enter your restaurant URL slug to access your console</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (loginSlug.trim()) {
                setIsLoginPromptOpen(false);
                const slugId = loginSlug.trim().toLowerCase();
                setLoginSlug('');
                navigate(`/login?restaurant=${slugId}`);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Restaurant Slug ID *</label>
                <input 
                  type="text" 
                  required 
                  value={loginSlug}
                  onChange={(e) => setLoginSlug(e.target.value)}
                  placeholder="E.g. swad_express" 
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border-none rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" 
                />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-all">
                Go to Scoped Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-950/60 py-8 border-t border-slate-200/40 dark:border-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          © 2026 QuickQR SAAS Platform. All Rights Reserved.
        </div>
      </footer>

    </div>
  );
}
