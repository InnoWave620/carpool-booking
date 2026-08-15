'use client';

import React, { useState } from 'react';
import { Vehicle, BusTrip, AuditEvent, Employee } from '@/types';
import { Settings, Shield, Bus, Car, FileText, Sliders, Users, Plus, CheckCircle } from 'lucide-react';
import { getAuditLogs } from '@/lib/audit';
import { INITIAL_EMPLOYEES } from '@/lib/store';

interface FleetAdminPanelProps {
  vehicles: Vehicle[];
  trips: BusTrip[];
  user: Employee;
  onUpdateCutoff: (tripId: string, cutoffHours: number) => void;
}

export const FleetAdminPanel: React.FC<FleetAdminPanelProps> = ({
  vehicles,
  trips,
  user,
  onUpdateCutoff
}) => {
  const [activeTab, setActiveTab] = useState<'FLEET' | 'TIMETABLE' | 'AUDIT' | 'USERS'>('FLEET');
  const auditLogs = getAuditLogs();

  return (
    <div className="space-y-6">
      
      {/* Admin Header */}
      <div className="bg-[#1C355E] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-[#EED58E] px-3 py-1 rounded-full border border-amber-400/30">
            System Administration
          </span>
          <h2 className="text-2xl font-black mt-2 flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#EED58E]" />
            AGL Fleet & Governance Controls
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Super Admin: Senzo Shinga • AGL Namibia Transport Hub Configuration
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/60">
          {[
            { id: 'FLEET', label: 'Vehicles', icon: Car },
            { id: 'TIMETABLE', label: 'Shuttle Cutoffs', icon: Bus },
            { id: 'AUDIT', label: 'Audit Trail', icon: FileText },
            { id: 'USERS', label: 'Staff Roles', icon: Users },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                  activeTab === t.id
                    ? 'bg-[#EED58E] text-[#1C355E] shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Vehicle Fleet Management */}
      {activeTab === 'FLEET' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#1C355E]">Vehicle Inventory Management</h3>
            <span className="text-xs text-slate-500 font-semibold">{vehicles.length} total vehicles active</span>
          </div>

          <div className="divide-y divide-slate-100">
            {vehicles.map(v => (
              <div key={v.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={v.imageUrl} alt={v.model} className="w-12 h-9 rounded-lg object-cover" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{v.make} {v.model} ({v.year})</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{v.registrationNumber} • {v.type.replace('_', ' ')} • {v.capacity} Seats</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                    v.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {v.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">{v.mileage.toLocaleString()} KM</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Shuttle Timetable & Cutoff Configuration */}
      {activeTab === 'TIMETABLE' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#1C355E]">Shuttle Cutoff Window Settings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure the advance notice threshold (e.g. 12 hours vs 24 hours). Bookings made closer than this threshold require driver approval.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {trips.map(trip => (
              <div key={trip.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#1C355E]">
                    {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Shuttle • {trip.originLocation?.code} → {trip.destinationLocation?.code}
                  </p>
                  <p className="text-xs text-slate-500">Vehicle: {trip.vehicle?.registrationNumber || 'N 142-991 WB'}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-600">Cutoff Threshold:</span>
                  <select
                    value={trip.cutoffHours}
                    onChange={(e) => onUpdateCutoff(trip.id, Number(e.target.value))}
                    className="text-xs font-bold p-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1C355E]"
                  >
                    <option value={12}>12 Hours Notice (Default)</option>
                    <option value={24}>24 Hours Notice</option>
                    <option value={6}>6 Hours Notice</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: System Immutable Audit Log */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-[#1C355E]">System Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable record of all booking creations, driver reviews, manager approvals & inspections.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
              {auditLogs.length} events logged
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.map(log => {
              const performer = INITIAL_EMPLOYEES.find(e => e.id === log.performerId);
              return (
                <div key={log.id} className="py-3 space-y-1 text-xs">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span className="text-[#1C355E] font-extrabold">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Performer: <strong>{performer ? `${performer.firstName} ${performer.lastName}` : log.performerId}</strong> • Entity: {log.entityType} ({log.entityId})
                  </p>
                  {log.metadata && (
                    <p className="font-mono text-[10px] bg-slate-50 p-1.5 rounded text-slate-500 overflow-x-auto">
                      {log.metadata}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Staff & Role Hierarchy */}
      {activeTab === 'USERS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#1C355E]">Staff Role Assignments & Governance</h3>
            <p className="text-xs text-slate-500">AGL Namibia workforce directory and role definitions.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {INITIAL_EMPLOYEES.map(emp => (
              <div key={emp.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={emp.avatarUrl} alt={emp.firstName} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{emp.firstName} {emp.lastName}</p>
                    <p className="text-[10px] text-slate-500">{emp.email}</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#1C355E] bg-slate-100 px-3 py-1 rounded-full uppercase">
                  {emp.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
