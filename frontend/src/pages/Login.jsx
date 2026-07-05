import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, Store, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [restaurantId, setRestaurantId] = useState('swad_express');
  const [restaurantName, setRestaurantName] = useState('QuickQR Restaurant');
  const [restaurantLogo, setRestaurantLogo] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Resolve active restaurant from query params
    const rest = searchParams.get('restaurant') || 'swad_express';
    setRestaurantId(rest);
    fetchBranding(rest);
  }, [searchParams]);

  const fetchBranding = async (restId) => {
    try {
      const res = await api.get(`/settings?restaurantId=${restId}`);
      if (res.data) {
        setRestaurantName(res.data.restaurantName || 'QuickQR Restaurant');
        setRestaurantLogo(res.data.restaurantLogo || '');
      }
    } catch (err) {
      console.error('Branding load error', err);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        isSuperAdmin: false,
        restaurantId
      });

      if (res.data.success) {
        // Save session
        localStorage.setItem('qr_rest_session', JSON.stringify(res.data.user));
        
        const role = res.data.user.role;
        const redirectUrl = searchParams.get('redirect');

        if (redirectUrl) {
          window.location.href = decodeURIComponent(redirectUrl);
        } else if (role === 'Admin' || role === 'Manager') {
          navigate(`/admin?restaurant=${restaurantId}`);
        } else {
          navigate(`/pos?restaurant=${restaurantId}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col justify-center items-center p-4 font-sans">
      
      {/* Back to landing */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Platform Landing</span>
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative">
        
        {/* Branding header */}
        <div className="text-center space-y-3 mb-8">
          {restaurantLogo ? (
            <img src={restaurantLogo} alt="Logo" className="w-16 h-16 rounded-2xl mx-auto object-cover shadow-sm border dark:border-slate-800" />
          ) : (
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Store className="w-8 h-8" />
            </div>
          )}
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{restaurantName}</span>
            <h2 className="text-2xl font-black mt-1">Staff Terminal Login</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in with employee credentials to enter POS / Admin console</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Registered Email *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@swad-express.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-950 border-none rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Master Password *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-950 border-none rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 text-xs flex justify-center items-center gap-1.5 disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating...' : 'Enter Scoped Outlet'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] font-bold text-slate-500">
          POWERED BY QUICKQR NETWORK SAAS
        </div>

      </div>
    </div>
  );
}
