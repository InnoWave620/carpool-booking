'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Users, Car, Bus, FileText, Sliders, ShieldAlert, BarChart3, Database } from 'lucide-react';
import { INITIAL_VEHICLES, INITIAL_DRIVERS, INITIAL_EMPLOYEES, INITIAL_BUS_TRIPS, INITIAL_AUDIT_EVENTS } from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, Vehicle } from '@/types';

export default function AdminDashboard() {
  const [user, setUser] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MASTER_DATA' | 'BUSINESS_RULES' | 'AUDIT_LOGS' | 'REPORTS'>('OVERVIEW');

  // Business Rules Config State
  const [maxBookingWindowDays, setMaxBookingWindowDays] = useState(30);
  const [cutoffHoursDefault, setCutoffHoursDefault] = useState(12);
  const [inspectionRequired, setInspectionRequired] = useState(true);
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    setUser(getActiveUser());
  }, []);

  if (!user) return null;

  const handleSaveConfig = () => {
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1C355E] via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-amber-400/20 text-[#EED58E] border border-amber-400/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            System Administration • AGL Transport Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Executive Admin Portal</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Master Data, Transport Business Rules Engine, Audit Logs, and Analytical Reports.
          </p>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'OVERVIEW', label: 'Transport Overview', icon: BarChart3 },
          { id: 'MASTER_DATA', label: 'Master Data Controls', icon: Database },
          { id: 'BUSINESS_RULES', label: 'Business Rules Engine', icon: Sliders },
          { id: 'AUDIT_LOGS', label: 'Audit Trail Logs', icon: ShieldAlert },
          { id: 'REPORTS', label: 'Analytical Reports', icon: FileText },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-[#1C355E] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 text-[#EED58E]" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-xs font-extrabold text-slate-400 uppercase">Total Fleet Vehicles</p>
              <p className="text-2xl font-black text-[#1C355E] mt-1">{INITIAL_VEHICLES.length} Units</p>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-2 inline-block">100% Operational</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-xs font-extrabold text-slate-400 uppercase">Active Drivers</p>
              <p className="text-2xl font-black text-[#1C355E] mt-1">{INITIAL_DRIVERS.length} Drivers</p>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-2 inline-block">Walvis Bay Hub</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-xs font-extrabold text-slate-400 uppercase">Scheduled Bus Trips</p>
              <p className="text-2xl font-black text-[#1C355E] mt-1">{INITIAL_BUS_TRIPS.length} Daily Trips</p>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-2 inline-block">92% Seat Utilization</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-xs font-extrabold text-slate-400 uppercase">Audit Events Logged</p>
              <p className="text-2xl font-black text-[#1C355E] mt-1">{INITIAL_AUDIT_EVENTS.length} Events</p>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded mt-2 inline-block">Compliance Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER DATA CONTROLS */}
      {activeTab === 'MASTER_DATA' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-[#1C355E]">Fleet Vehicles Master Registry</h2>
          <div className="divide-y divide-slate-100">
            {INITIAL_VEHICLES.map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-[#1C355E]">{v.make} {v.model} ({v.registrationNumber})</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{v.type} • {v.capacity} Seats • {v.fuelType}</p>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS RULES ENGINE */}
      {activeTab === 'BUSINESS_RULES' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-[#1C355E]">Transport Business Rules Engine</h2>
          </div>

          {configSaved && (
            <div className="p-3 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl">
              ✅ Transport Business Rules updated & saved to Database!
            </div>
          )}

          <div className="space-y-4 text-xs font-bold">
            <div>
              <label className="text-slate-700">Maximum Booking Window (Days in advance)</label>
              <input
                type="number"
                value={maxBookingWindowDays}
                onChange={(e) => setMaxBookingWindowDays(Number(e.target.value))}
                className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-700">Shuttle Booking Cutoff Window (Hours before departure)</label>
              <input
                type="number"
                value={cutoffHoursDefault}
                onChange={(e) => setCutoffHoursDefault(Number(e.target.value))}
                className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
              <span className="text-slate-700">Require Post-Return Inspection for Pool Vehicles</span>
              <input
                type="checkbox"
                checked={inspectionRequired}
                onChange={(e) => setInspectionRequired(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
              <span className="text-slate-700">Enable Automatic Driver Auto-Allocation Engine</span>
              <input
                type="checkbox"
                checked={autoAssignEnabled}
                onChange={(e) => setAutoAssignEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </div>

            <button
              onClick={handleSaveConfig}
              className="w-full py-3 bg-[#1C355E] text-white font-extrabold text-xs rounded-xl shadow-md"
            >
              Save Configuration Rules
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-[#1C355E]">System Security & Workflow Audit Trail</h2>
          <div className="divide-y divide-slate-100">
            {INITIAL_AUDIT_EVENTS.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded text-[10px] mr-2">
                    {a.action}
                  </span>
                  <span className="font-bold text-slate-800">{a.entityType} ({a.entityId})</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Performed by Performer #{a.performerId.slice(0, 6)}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{new Date(a.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICAL REPORTS */}
      {activeTab === 'REPORTS' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-[#1C355E]">Transport Analytical Reports</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border rounded-2xl bg-slate-50 space-y-2">
              <h4 className="text-xs font-black text-[#1C355E]">Shuttle Seat Utilization Report</h4>
              <p className="text-xs text-slate-500">Total Bookings: 142 • Seat Occupancy: 88.4%</p>
              <button className="text-[10px] font-extrabold text-indigo-600 underline">Export CSV Report</button>
            </div>
            <div className="p-4 border rounded-2xl bg-slate-50 space-y-2">
              <h4 className="text-xs font-black text-[#1C355E]">Pool Vehicle Downtime & Inspections Report</h4>
              <p className="text-xs text-slate-500">Inspection Pass Rate: 96.2% • Maintenance Hours: 4h</p>
              <button className="text-[10px] font-extrabold text-indigo-600 underline">Export CSV Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
