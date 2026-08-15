'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bus, 
  Car, 
  CheckSquare, 
  ShieldCheck, 
  Settings, 
  Calendar, 
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  Clock
} from 'lucide-react';
import { Navbar } from './Navbar';
import { getActiveUser, hasPermission } from '@/lib/auth';
import { Employee } from '@/types';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [user, setUser] = useState<Employee | null>(null);

  useEffect(() => {
    setUser(getActiveUser());
  }, []);

  if (!user) return null;

  const isDriver = user.role === 'DRIVER' || user.role === 'SUPER_ADMIN';
  const isManager = user.role === 'MANAGER' || user.role === 'SUPER_ADMIN';
  const isFleetAdmin = user.role === 'FLEET_ADMIN' || user.role === 'SUPER_ADMIN';
  const isAdmin = user.role === 'SUPER_ADMIN';

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { href: '/bus-schedule', label: 'Bus Schedule', icon: Bus, show: true },
    { href: '/my-bookings', label: 'My Bookings', icon: Calendar, show: true },
    { href: '/driver-console', label: 'Driver Console', icon: ClipboardList, show: isDriver, badge: 'Phase 1' },
    { href: '/pool-vehicles', label: 'Pool Vehicles', icon: Car, show: true, badge: 'Phase 2' },
    { href: '/approvals', label: 'Manager Inbox', icon: CheckSquare, show: isManager },
    { href: '/inspections', label: 'Return Inspections', icon: ShieldCheck, show: isFleetAdmin },
    { href: '/admin', label: 'Fleet Admin', icon: Settings, show: isAdmin },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onUserChange={(updated) => setUser(updated)} />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 p-4 border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)]">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
            {navItems.filter(item => item.show).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    active 
                      ? 'bg-[#1C355E] text-white shadow-md shadow-[#1C355E]/15 font-semibold' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#EED58E]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                      active ? 'bg-amber-400/20 text-[#EED58E]' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Persona Card Widget in Sidebar */}
          <div className="mt-8 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#1C355E] text-white shadow-lg">
            <div className="flex items-center space-x-3">
              <img src={user.avatarUrl} alt={user.firstName} className="w-10 h-10 rounded-full object-cover border-2 border-[#EED58E]" />
              <div>
                <p className="text-xs font-bold text-white leading-tight">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-[#EED58E] font-medium uppercase tracking-wider mt-0.5">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#2DD4BF]" /> Walvis Bay
              </span>
              <span className="text-[#EED58E] font-medium">AGL Namibia</span>
            </div>
          </div>
        </aside>

        {/* Main Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (App Experience for Phones) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 shadow-2xl flex justify-around items-center">
        {navItems.filter(item => item.show).slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
                active ? 'text-[#1C355E] font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-lg ${active ? 'bg-amber-100 text-[#1C355E]' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
};
