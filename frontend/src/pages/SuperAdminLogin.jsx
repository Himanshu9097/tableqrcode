import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, ShieldAlert, AlertCircle, ArrowLeft } from 'lucide-react';

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        isSuperAdmin: true
      });

      if (res.data.success) {
        localStorage.setItem('qr_rest_session', JSON.stringify(res.data.user));
        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl) {
          window.location.href = decodeURIComponent(redirectUrl);
        } else {
          navigate('/super-admin');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Super Admin credentials.');
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
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-rose-555">Global SAAS Console</span>
            <h2 className="text-2xl font-black mt-1">Super Admin Login</h2>
            <p className="text-xs text-slate-400 mt-1">Enter master credential coordinates to manage the tenant network</p>
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
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Master Email *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="super@quickqr.io"
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
            className="w-full py-4 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black rounded-2xl shadow-lg transition-all active:scale-95 text-xs flex justify-center items-center gap-1.5 disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating...' : 'Enter Master Console'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] font-bold text-slate-500">
          SECURED ENVELOPE GATEWAY
        </div>

      </div>
    </div>
  );
}
