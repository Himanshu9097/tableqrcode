import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Layers, Sparkles, 
  Monitor, QrCode, CookingPot, 
  X, CheckCircle, AlertCircle, Menu,
  ArrowRight, Moon, Sun
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Form Fields
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [loginSlug, setLoginSlug] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  };

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
        plan: 'Pro', // Backend might still require plan
        password: regPassword
      });
      showToast(`${regName} registered! Launching control panel...`, 'success');
      setIsRegisterOpen(false);
      setRegName(''); setRegId(''); setRegEmail(''); setRegPhone(''); setRegPassword('');
      setTimeout(() => navigate(`/admin?restaurant=${regId}`), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register brand.', 'error');
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-100 min-h-screen font-sans selection:bg-blue-500/30 transition-colors duration-300">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl border backdrop-blur-md ${toast.type === 'error' ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400'} animate-slide-up`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Glass Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/60 dark:bg-[#050505]/60 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-6 h-16 flex items-center justify-between transition-colors duration-300">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">QuickQR</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-slate-500 dark:text-slate-400">
            <a href="#system" className="hover:text-slate-900 dark:hover:text-white transition-colors">The System</a>
            <button onClick={() => setIsLoginPromptOpen(true)} className="hover:text-slate-900 dark:hover:text-white transition-colors">Merchant Login</button>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-white/10">
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button onClick={() => setIsRegisterOpen(true)} className="hidden sm:flex px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-semibold rounded-full text-[13px] transition-colors items-center gap-2 shadow-sm">
              Get Started
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white md:hidden transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-7xl mx-auto min-h-[90dvh] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-generation restaurant OS</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Run your <br/>
              restaurant <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-400 dark:from-white dark:to-slate-500">beautifully.</span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal max-w-[480px]">
              A complete, isolated operating system for modern dining. Point of sale, QR ordering, and kitchen display—all working in perfect sync.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={() => setIsRegisterOpen(true)} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium rounded-full transition-colors flex items-center justify-center gap-2 text-sm shadow-[0_0_24px_rgba(37,99,235,0.2)] dark:shadow-[0_0_24px_rgba(37,99,235,0.4)]">
                Launch your system
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/super-admin')} className="px-8 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 text-slate-900 dark:text-white font-medium rounded-full transition-colors flex items-center justify-center gap-2 text-sm backdrop-blur-sm shadow-sm dark:shadow-none">
                Explore Admin
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 blur-[100px] rounded-full" />
            <div className="relative rounded-[32px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 bg-white dark:bg-[#0a0a0a]">
              <img src="/pos_hero.jpg" alt="Restaurant POS Interface" className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 dark:from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* The System Bento Grid */}
      <section id="system" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 dark:text-white mb-4">The complete toolkit.</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg">Everything you need to scale your operations, engineered with obsessive attention to detail.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main feature - KDS */}
          <div className="md:col-span-2 rounded-[32px] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col md:flex-row group hover:shadow-md dark:hover:bg-white/[0.04] transition-all duration-500">
            <div className="p-10 md:p-12 md:w-1/2 flex flex-col justify-center space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CookingPot className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Kitchen Display System</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                Stream incoming tickets directly to beautifully legible tablet screens. Mark cooking times, allocate chefs, and eliminate paper waste completely.
              </p>
            </div>
            <div className="md:w-1/2 relative min-h-[300px] bg-slate-50 dark:bg-transparent">
              <div className="absolute inset-4 md:inset-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200 dark:shadow-black/50">
                <img src="/kds_screen.jpg" alt="KDS" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>

          {/* Sub feature 1 - POS */}
          <div className="rounded-[32px] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col group hover:shadow-md dark:hover:bg-white/[0.04] transition-all duration-500">
            <div className="p-10 pb-0 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <Monitor className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">Point of Sale</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Take walk-in orders, manage tables, and split checks from a lightning-fast native register interface.
              </p>
            </div>
            <div className="p-10 pt-8 mt-auto bg-slate-50 dark:bg-transparent">
               <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200 dark:shadow-black/50 relative aspect-video">
                 <img src="/pos_hero.jpg" alt="POS screen" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
               </div>
            </div>
          </div>

          {/* Sub feature 2 - QR */}
          <div className="rounded-[32px] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col group hover:shadow-md dark:hover:bg-white/[0.04] transition-all duration-500">
            <div className="p-10 pb-0 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">Contactless Menu</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Diners scan to browse immersive digital menus, submit orders, and track preparation directly from their phones.
              </p>
            </div>
            <div className="p-10 pt-8 mt-auto flex justify-center bg-slate-50 dark:bg-transparent">
               <div className="rounded-[24px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200 dark:shadow-black/50 relative w-3/4 max-w-[240px] aspect-[9/16]">
                 <img src="/qr_menu.jpg" alt="QR menu on phone" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Modals */}
      {/* 1. Register */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-[#050505]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 max-w-md w-full rounded-[32px] p-8 shadow-2xl relative">
            <button onClick={() => setIsRegisterOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-medium text-2xl mb-2 text-slate-900 dark:text-white tracking-tight">System Initialization</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-8">Deploy your isolated restaurant environment.</p>
            
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Restaurant Name</label>
                <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g. The Noir" className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Network Slug</label>
                <input type="text" required value={regId} onChange={(e) => setRegId(e.target.value)} placeholder="e.g. the_noir" pattern="^[a-z0-9_]+$" className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Admin Email</label>
                  <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="admin@noir.com" className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Phone</label>
                  <input type="tel" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="9876543210" pattern="^[6-9]\d{9}$" maxLength={10} className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Access Password</label>
                <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" minLength={6} className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
              </div>
              
              <button type="submit" className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium rounded-full transition-colors text-sm shadow-[0_0_16px_rgba(37,99,235,0.2)] dark:shadow-[0_0_16px_rgba(37,99,235,0.3)]">
                Initialize System
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Login */}
      {isLoginPromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-[#050505]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 max-w-sm w-full rounded-[32px] p-8 shadow-2xl relative">
            <button onClick={() => setIsLoginPromptOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-medium text-2xl mb-2 text-slate-900 dark:text-white tracking-tight">System Access</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-8">Enter your network slug to authenticate.</p>
            
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
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Network Slug</label>
                <input type="text" required value={loginSlug} onChange={(e) => setLoginSlug(e.target.value)} placeholder="e.g. the_noir" className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
              </div>
              <button type="submit" className="w-full mt-4 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-medium rounded-full transition-colors text-sm">
                Authenticate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl md:hidden pt-24 px-6">
          <div className="flex flex-col space-y-6">
            <a href="#system" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">The System</a>
            <div onClick={() => { setIsMobileMenuOpen(false); setIsLoginPromptOpen(true); }} className="text-xl font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Merchant Login</div>
            <button onClick={() => { setIsMobileMenuOpen(false); setIsRegisterOpen(true); }} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-medium rounded-full mt-8">
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="font-semibold text-xs tracking-tight text-slate-400 dark:text-slate-500">QuickQR OS</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-600 font-medium">
            © 2026 Platform. All rights reserved.
          </div>
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/terms')}>
            Terms & Privacy
          </div>
        </div>
      </footer>
    </div>
  );
}
