'use client';

import React, { useState } from 'react';
import { BusTrip, BusBooking, Employee } from '@/types';
import { Bus, CheckCircle2, XCircle, Users, Clock, MapPin, AlertCircle, Phone, Check } from 'lucide-react';
import { INITIAL_EMPLOYEES } from '@/lib/store';

interface DriverConsoleProps {
  trips: BusTrip[];
  bookings: BusBooking[];
  onApproveBooking: (bookingId: string, driverComment?: string) => void;
  onRejectBooking: (bookingId: string, driverComment?: string) => void;
}

export const DriverConsole: React.FC<DriverConsoleProps> = ({
  trips,
  bookings,
  onApproveBooking,
  onRejectBooking
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '');
  const [checkedPassengers, setCheckedPassengers] = useState<Record<string, boolean>>({});
  const [actionComment, setActionComment] = useState<string>('');

  const activeTrip = trips.find(t => t.id === selectedTripId) || trips[0];
  const tripBookings = bookings.filter(b => b.busTripId === activeTrip?.id);
  const pendingBookings = tripBookings.filter(b => b.status === 'PENDING_DRIVER_APPROVAL');
  const approvedBookings = tripBookings.filter(b => b.status === 'AUTO_APPROVED' || b.status === 'APPROVED_BY_DRIVER');

  const toggleCheckIn = (bookingId: string) => {
    setCheckedPassengers(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Driver Console Header */}
      <div className="bg-[#1C355E] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-[#EED58E] px-3 py-1 rounded-full border border-amber-400/30">
            Driver Dispatch Console
          </span>
          <h2 className="text-2xl font-black mt-2 flex items-center gap-2">
            <Bus className="w-7 h-7 text-[#EED58E]" />
            Passenger Manifest & Late Approvals
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Driver: Johannes Nangolo • Vehicle N 142-991 WB (Toyota Coaster)
          </p>
        </div>

        {/* Quick Shuttle Trip Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {trips.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTripId(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedTripId === t.id
                  ? 'bg-[#EED58E] text-[#1C355E] shadow-md font-extrabold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {new Date(t.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({t.originLocation?.code}→{t.destinationLocation?.code})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Pending Approvals & Passenger Manifest */}
      {activeTrip && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Pending Late-Booking Approval Queue */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[#1C355E] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Pending Late Bookings
              </h3>
              <span className="text-xs font-extrabold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                {pendingBookings.length} pending
              </span>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                No pending late-booking requests for this shuttle.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map(book => {
                  const passenger = INITIAL_EMPLOYEES.find(e => e.id === book.employeeId);
                  return (
                    <div key={book.id} className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img 
                            src={passenger?.avatarUrl || 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200'} 
                            alt={passenger?.firstName}
                            className="w-8 h-8 rounded-full object-cover" 
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{passenger?.firstName} {passenger?.lastName}</p>
                            <p className="text-[10px] text-slate-500">{passenger?.phone}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                          {book.passengerCount} Seat(s)
                        </span>
                      </div>

                      <p className="text-[11px] text-amber-950 font-medium">
                        Requested within 12h cutoff window. Driver confirmation required to grant seats.
                      </p>

                      {/* Driver Action Comment Input */}
                      <input
                        type="text"
                        placeholder="Optional comment (e.g. Approved, pickup at HQ gate)"
                        value={actionComment}
                        onChange={(e) => setActionComment(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            onApproveBooking(book.id, actionComment);
                            setActionComment('');
                          }}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => {
                            onRejectBooking(book.id, actionComment);
                            setActionComment('');
                          }}
                          className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Confirmed Passenger Manifest */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-[#1C355E]">Confirmed Passenger Manifest</h3>
                <p className="text-xs text-slate-500">
                  {new Date(activeTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Shuttle • {activeTrip.originLocation?.code} → {activeTrip.destinationLocation?.code}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  {approvedBookings.reduce((sum, b) => sum + b.passengerCount, 0)} Seats Confirmed
                </span>
              </div>
            </div>

            {/* Passenger List */}
            <div className="divide-y divide-slate-100">
              {approvedBookings.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">No confirmed passengers for this shuttle yet.</p>
              ) : (
                approvedBookings.map((book) => {
                  const passenger = INITIAL_EMPLOYEES.find(e => e.id === book.employeeId);
                  const isChecked = checkedPassengers[book.id] || false;

                  return (
                    <div 
                      key={book.id} 
                      className={`py-3.5 px-3 rounded-xl flex items-center justify-between transition-colors ${
                        isChecked ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleCheckIn(book.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            isChecked 
                              ? 'bg-emerald-600 text-white font-bold' 
                              : 'border-2 border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <img 
                          src={passenger?.avatarUrl} 
                          alt={passenger?.firstName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                        />

                        <div>
                          <p className="text-xs font-bold text-slate-900">{passenger?.firstName} {passenger?.lastName}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span>Phone: {passenger?.phone}</span>
                            <span>•</span>
                            <span className="font-semibold text-[#1C355E]">{passenger?.departmentId.toUpperCase()}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-extrabold text-[#1C355E] bg-slate-100 px-2.5 py-1 rounded-lg">
                          {book.passengerCount} Seat(s)
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isChecked ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isChecked ? 'On Board' : 'Awaiting Boarding'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
