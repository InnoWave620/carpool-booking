'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Car, 
  CheckSquare, 
  ShieldAlert, 
  Users, 
  Bell, 
  MapPin, 
  ChevronDown,
  UserCheck,
  Building
} from 'lucide-react';
import { INITIAL_EMPLOYEES } from '@/lib/store';
import { getActiveUser, setActiveUser } from '@/lib/auth';
import { getUserNotifications } from '@/lib/notifications';
import { Employee } from '@/types';

interface NavbarProps {
  onUserChange?: (user: Employee) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onUserChange }) => {
  const [currentUser, setCurrentUser] = useState<Employee>(INITIAL_EMPLOYEES[0]);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const active = getActiveUser();
    setCurrentUser(active);
  }, []);

  const handleSelectUser = (emp: Employee) => {
    const updated = setActiveUser(emp.id);
    setCurrentUser(updated);
    setShowRoleSelector(false);
    if (onUserChange) onUserChange(updated);
    
    // Redirect to the role's primary authorized dashboard
    const defaultRoute = 
      emp.role === 'DRIVER' ? '/driver/dashboard' :
      emp.role === 'MANAGER' ? '/manager/dashboard' :
      emp.role === 'FLEET_ADMIN' ? '/inspector/dashboard' :
      emp.role === 'SUPER_ADMIN' ? '/admin/dashboard' :
      '/employee/dashboard';

    window.location.href = defaultRoute;
  };

  const notifications = getUserNotifications(currentUser.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1C355E] text-white border-b border-slate-700/50 shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Branding & Site Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EED58E] to-amber-200 flex items-center justify-center text-[#1C355E] font-extrabold text-xl shadow-inner">
            AGL
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Transport Hub</h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                <svg className="w-2.5 h-2.5" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                Microsoft Entra ID
              </span>
            </div>
            <p className="text-xs text-slate-300 hidden sm:flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#2DD4BF]" /> Walvis Bay Logistics Hub
            </p>
          </div>
        </div>

        {/* Right: Active Role Switcher & Notifications */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 hover:text-white transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-[#1C355E]">Notifications</h3>
                  <span className="text-xs text-slate-500">{notifications.length} alerts</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No new notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="py-3 hover:bg-slate-50 rounded-lg px-2 transition-colors">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400">Just now</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{n.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl transition-all"
            >
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.firstName}
                className="w-7 h-7 rounded-full object-cover border border-[#EED58E]" 
              />
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold leading-tight text-white">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-[10px] font-medium text-[#EED58E] uppercase tracking-wider">{currentUser.role.replace('_', ' ')}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showRoleSelector && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 p-2 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Switch Persona / Test Role</p>
                </div>
                <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto mt-1">
                  {INITIAL_EMPLOYEES.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => handleSelectUser(emp)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        emp.id === currentUser.id ? 'bg-amber-50/80 border border-amber-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img src={emp.avatarUrl} alt={emp.firstName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{emp.role.replace('_', ' ')}</p>
                        </div>
                      </div>
                      {emp.id === currentUser.id && (
                        <UserCheck className="w-4 h-4 text-amber-600" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100">
                  <a
                    href="/login"
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
                  >
                    <span>Sign Out (Microsoft Session)</span>
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
