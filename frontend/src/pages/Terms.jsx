import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-300 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-emerald-500 font-bold mb-8 hover:underline">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-3xl font-black mb-6">Terms of Service</h1>
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">1. Introduction</h2>
            <p>These Terms of Service ("Terms") govern your access to and use of QuickQR SAAS ("Service"). By accessing, registering for, or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">2. Eligibility</h2>
            <p>You must be at least 18 years old and legally capable of entering into a binding agreement to use the Service.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">3. Account Registration and Responsibilities</h2>
            <p>You are responsible for providing accurate and complete information, maintaining the confidentiality of your login credentials, keeping your account information up to date, and all activities performed through your account.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">4. Use of the Service</h2>
            <p>You agree to use the Service only for lawful purposes and in compliance with all applicable laws and regulations. You must not use the Service for illegal, fraudulent, deceptive, or harmful activities.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">5. QR Codes and User Content</h2>
            <p>You retain ownership of the content, links, text, images, logos, and other materials that you submit or upload to the Service ("User Content").</p>
          </div>
          
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">6. Payments and Fees</h2>
            <p>Certain features of the Service may require payment. Subscription fees, one-time charges, transaction fees, and applicable taxes will be displayed before you complete a purchase.</p>
          </div>
          
          <p className="mt-8 font-bold">For more details, contact us at legal@quickqr.io.</p>
        </div>
      </div>
    </div>
  );
}
