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

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!user) return null;

  const isDriver = user.role === 'DRIVER' || user.role === 'SUPER_ADMIN';
  const isManager = user.role === 'MANAGER' || user.role === 'SUPER_ADMIN';
  const isInspector = user.role === 'FLEET_ADMIN' || user.role === 'SUPER_ADMIN';
  const isAdmin = user.role === 'SUPER_ADMIN';
  const isRider = user.role === 'EMPLOYEE' || user.role === 'MANAGER' || user.role === 'FLEET_ADMIN' || user.role === 'SUPER_ADMIN';

  const roleNavItems: Array<{ href: string; label: string; icon: any; show: boolean; badge?: string }> = [
    { href: '/employee/dashboard', label: 'Rider Portal', icon: LayoutDashboard, show: isRider, badge: 'Rider' },
    { href: '/driver/dashboard', label: 'Driver Console', icon: ClipboardList, show: isDriver, badge: 'Driver' },
    { href: '/manager/dashboard', label: 'Manager Hub', icon: CheckSquare, show: isManager, badge: 'Manager' },
    { href: '/inspector/dashboard', label: 'Inspector Gate', icon: ShieldCheck, show: isInspector, badge: 'Inspector' },
    { href: '/admin/dashboard', label: 'Admin & Rules', icon: Settings, show: isAdmin, badge: 'Admin' },
  ];

  const fleetNavItems: Array<{ href: string; label: string; icon: any; show: boolean; badge?: string }> = [
    { href: '/bus-schedule', label: 'Bus Schedule', icon: Bus, show: isRider },
    { href: '/pool-vehicles', label: 'Pool Vehicles', icon: Car, show: isManager || isInspector || isAdmin },
    { href: '/my-bookings', label: 'My Bookings', icon: Calendar, show: isRider },
  ];

  // Route-Level Authorization Check
  const routePermissions: Record<string, boolean> = {
    '/employee/dashboard': isRider,
    '/driver/dashboard': isDriver,
    '/manager/dashboard': isManager,
    '/inspector/dashboard': isInspector,
    '/admin/dashboard': isAdmin,
  };

  const isRestricted = pathname in routePermissions && !routePermissions[pathname];

  const authorizedHome = 
    isDriver && !isAdmin ? '/driver/dashboard' :
    isManager && !isAdmin ? '/manager/dashboard' :
    isInspector && !isAdmin ? '/inspector/dashboard' :
    isAdmin ? '/admin/dashboard' :
    '/employee/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onUserChange={(updated) => setUser(updated)} />

      <div className="flex-1 w-full flex">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 p-4 border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)]">
          <div className="space-y-4">
            <div>
              <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Role Dashboards</p>
              <div className="space-y-1">
                {roleNavItems.filter(item => item.show).map((item) => {
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
            </div>

            <div>
              <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Fleet Dispatch & Schedules</p>
              <div className="space-y-1">
                {fleetNavItems.filter(item => item.show).map((item) => {
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
            </div>
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
        <main className="flex-1 p-6 lg:p-8 pb-8 max-w-full overflow-x-auto">
          {isRestricted ? (
            <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-lg mx-auto my-12 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
                🔒
              </div>
              <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
              <p className="text-sm text-slate-600">
                Your corporate account role (<span className="font-bold text-[#1C355E]">{user.role.replace('_', ' ')}</span>) does not have authorization to view this console.
              </p>
              <div className="pt-2">
                <Link
                  href={authorizedHome}
                  className="inline-block px-6 py-2.5 bg-[#1C355E] text-white text-xs font-extrabold rounded-xl shadow-md hover:bg-slate-800 transition-all"
                >
                  Return to Your Authorized Dashboard
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

    </div>
  );
};
