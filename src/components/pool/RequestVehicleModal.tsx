'use client';

import React, { useState } from 'react';
import { Vehicle, Employee } from '@/types';
import { Car, Calendar, Clock, FileText, UserCheck, AlertCircle } from 'lucide-react';
import { INITIAL_EMPLOYEES } from '@/lib/store';

interface RequestVehicleModalProps {
  vehicles: Vehicle[];
  user: Employee;
  onClose: () => void;
  onSubmitRequest: (params: {
    vehicleId: string;
    purpose: string;
    startDateTime: string;
    endDateTime: string;
  }) => void;
}

export const RequestVehicleModal: React.FC<RequestVehicleModalProps> = ({
  vehicles,
  user,
  onClose,
  onSubmitRequest
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [purpose, setPurpose] = useState<string>('');
  
  // Default start date = tomorrow 08:00, end date = tomorrow 17:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const defaultStart = `${tomorrow.toISOString().split('T')[0]}T08:00`;
  const defaultEnd = `${tomorrow.toISOString().split('T')[0]}T17:00`;

  const [startDateTime, setStartDateTime] = useState<string>(defaultStart);
  const [endDateTime, setEndDateTime] = useState<string>(defaultEnd);

  const manager = INITIAL_EMPLOYEES.find(e => e.id === user.managerId) || INITIAL_EMPLOYEES.find(e => e.role === 'MANAGER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;
    onSubmitRequest({
      vehicleId: selectedVehicleId,
      purpose,
      startDateTime,
      endDateTime,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1C355E] to-[#25467A] text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-400/20 text-[#EED58E] rounded-xl">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Request Pool Vehicle</h3>
                <p className="text-xs text-slate-300">Phase 2 • Business Trip Fleet Reservation</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white text-xl font-bold p-1"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Manager Approval Route Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#1C355E]" />
              Approving Manager:
            </span>
            <span className="font-bold text-[#1C355E]">
              {manager ? `${manager.firstName} ${manager.lastName}` : 'Klaus Schneider'}
            </span>
          </div>

          {/* Select Vehicle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Vehicle
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
              {vehicles.map(v => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    selectedVehicleId === v.id
                      ? 'bg-amber-50/80 border-amber-400 text-slate-900 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img src={v.imageUrl} alt={v.model} className="w-12 h-9 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{v.make} {v.model}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{v.registrationNumber} • {v.fuelType}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#1C355E] bg-slate-100 px-2 py-1 rounded-md">
                    {v.capacity} Seats
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1C355E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1C355E]"
              />
            </div>
          </div>

          {/* Purpose of Trip */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Purpose of Business Trip
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. On-site cargo inspection at Port of Walvis Bay / Customs audit..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1C355E]"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#EED58E] to-amber-300 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md transition-all"
            >
              Submit Request to Manager
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
