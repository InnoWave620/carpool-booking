'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, MapPin, CheckCircle2, Lock, ArrowRight, X } from 'lucide-react';
import { INITIAL_EMPLOYEES } from '@/lib/store';
import { setActiveUser } from '@/lib/auth';
import { Employee } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [showMsModal, setShowMsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Employee>(INITIAL_EMPLOYEES[0]);
  const [authenticating, setAuthenticating] = useState(false);

  const handleSimulatedMicrosoftLogin = (emp?: Employee) => {
    const target = emp || selectedUser;
    setAuthenticating(true);

    setTimeout(() => {
      setActiveUser(target.id);
      setAuthenticating(false);
      setShowMsModal(false);
      router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1C355E]/40 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-[#1C355E] border-2 border-[#EED58E] rounded-2xl flex items-center justify-center p-1.5 shadow-2xl backdrop-blur-md">
            <img src="/agloggo.png" alt="AGL Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        <h2 className="text-center text-3xl font-black text-white tracking-tight">
          AGL Transport Hub
        </h2>
        <p className="mt-1.5 text-center text-xs font-bold text-[#EED58E] uppercase tracking-widest">
          Microsoft Entra ID • Single Sign-On Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-2xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 space-y-6">
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Microsoft 365 Verified Organization</span>
            </div>
          </div>

          {/* Primary Action Button: Sign in with Microsoft */}
          <button
            onClick={() => setShowMsModal(true)}
            className="w-full flex items-center justify-center space-x-3.5 px-5 py-4 border border-slate-300 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Official Microsoft 4-Color Icon */}
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z"/>
              <path fill="#81bc06" d="M12 1h10v10H12z"/>
              <path fill="#05a6f0" d="M1 12h10v10H1z"/>
              <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            <span>Sign in with Microsoft Entra ID</span>
          </button>

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            Clicking above simulates Microsoft Entra ID Single Sign-On for AGL Namibia staff & partners.
          </p>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" /> Walvis Bay Hub
            </span>
            <span className="text-[#EED58E] font-semibold">AGL Group Tenant</span>
          </div>

        </div>
      </div>

      {/* Simulated Microsoft 365 / Entra ID Account Picker Modal */}
      {showMsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            
            {/* Microsoft Header Bar */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <svg className="w-6 h-6" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Microsoft</h3>
                  <p className="text-[10px] font-semibold text-slate-500">login.microsoftonline.com</p>
                </div>
              </div>

              <button 
                onClick={() => setShowMsModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Selector Content */}
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-lg font-black text-slate-900">Pick an account</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  to continue to <strong className="text-[#1C355E]">AGL Transport Hub (Namibia)</strong>
                </p>
              </div>

              {/* Microsoft Account List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {INITIAL_EMPLOYEES.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => handleSimulatedMicrosoftLogin(emp)}
                    disabled={authenticating}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 transition-all flex items-center justify-between group disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-3.5">
                      <img 
                        src={emp.avatarUrl} 
                        alt={emp.firstName} 
                        className="w-10 h-10 rounded-full border border-slate-300 object-cover" 
                      />
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 group-hover:text-[#1C355E]">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">{emp.email}</p>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          Entra OID: {emp.id.replace('emp-', '77a-')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {emp.role.replace('_', ' ')}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1C355E] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Bottom Security Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" /> AGL Single Sign-On
                </span>
                <span className="font-semibold text-slate-500">Tenant: aglgroup.onmicrosoft.com</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
