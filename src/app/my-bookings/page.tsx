'use client';

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_BUS_BOOKINGS, 
  INITIAL_BUS_TRIPS, 
  INITIAL_POOL_REQUESTS, 
  INITIAL_VEHICLES 
} from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, BusBooking, PoolVehicleRequest } from '@/types';
import { Calendar, Bus, Car, Clock, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { logAuditEvent } from '@/lib/audit';

export default function MyBookingsPage() {
  const [user, setUser] = useState<Employee | null>(null);
  const [busBookings, setBusBookings] = useState<BusBooking[]>(INITIAL_BUS_BOOKINGS);
  const [poolRequests, setPoolRequests] = useState<PoolVehicleRequest[]>(INITIAL_POOL_REQUESTS);

  useEffect(() => {
    setUser(getActiveUser());
  }, []);

  if (!user) return null;

  const myBusBookings = busBookings.filter(b => b.employeeId === user.id);
  const myPoolRequests = poolRequests.filter(r => r.requesterId === user.id);

  const handleCancelBusBooking = (bookingId: string) => {
    setBusBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
    logAuditEvent({
      performerId: user.id,
      action: 'BUS_BOOKING_CANCELLED',
      entityType: 'BusBooking',
      entityId: bookingId
    });
  };

  const handleCancelPoolRequest = (requestId: string) => {
    setPoolRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'CANCELLED' } : r));
    logAuditEvent({
      performerId: user.id,
      action: 'POOL_REQUEST_CANCELLED',
      entityType: 'PoolVehicleRequest',
      entityId: requestId
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C355E] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-500" />
            My Bookings & Reservations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your scheduled bus shuttle seats and pool vehicle business trip requests.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {myBusBookings.length + myPoolRequests.length} Active Records
          </span>
        </div>
      </div>

      {/* Section 1: Company Bus Seat Reservations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-[#1C355E] flex items-center gap-2">
            <Bus className="w-5 h-5 text-[#1C355E]" />
            Shuttle Bus Seat Reservations (Phase 1)
          </h3>
          <span className="text-xs font-bold text-slate-500">{myBusBookings.length} bookings</span>
        </div>

        <div className="divide-y divide-slate-100">
          {myBusBookings.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">You have no active shuttle seat reservations.</p>
          ) : (
            myBusBookings.map(b => {
              const trip = INITIAL_BUS_TRIPS.find(t => t.id === b.busTripId) || INITIAL_BUS_TRIPS[0];
              const depTime = new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-extrabold text-[#1C355E]">{depTime} Shuttle</span>
                      <span className="text-xs font-bold text-slate-700">
                        {trip.originLocationId === 'loc-1' ? 'HQ' : 'WMT'} → {trip.destinationLocationId === 'loc-2' ? 'WMT Terminal' : 'Customs'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Seats Reserved: <strong>{b.passengerCount}</strong> • Booked on: {new Date(b.bookedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${
                      b.status === 'AUTO_APPROVED' 
                        ? 'badge-auto-approved' 
                        : b.status === 'PENDING_DRIVER_APPROVAL'
                        ? 'badge-pending-driver'
                        : 'badge-rejected'
                    }`}>
                      {b.status.replace('_', ' ')}
                    </span>

                    {b.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelBusBooking(b.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold rounded-lg transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 2: Pool Vehicle Business Trip Reservations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-[#1C355E] flex items-center gap-2">
            <Car className="w-5 h-5 text-[#1C355E]" />
            Pool Vehicle Requests (Phase 2)
          </h3>
          <span className="text-xs font-bold text-slate-500">{myPoolRequests.length} requests</span>
        </div>

        <div className="divide-y divide-slate-100">
          {myPoolRequests.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">You have no active pool vehicle requests.</p>
          ) : (
            myPoolRequests.map(r => {
              const vehicle = INITIAL_VEHICLES.find(v => v.id === r.vehicleId);
              return (
                <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#1C355E]">
                      {vehicle?.make} {vehicle?.model} ({vehicle?.registrationNumber})
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Duration: <strong>{new Date(r.startDateTime).toLocaleDateString()}</strong> → <strong>{new Date(r.endDateTime).toLocaleDateString()}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">"{r.purpose}"</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${
                      r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status.replace('_', ' ')}
                    </span>

                    {r.status !== 'CANCELLED' && r.status !== 'RETURNED' && (
                      <button
                        onClick={() => handleCancelPoolRequest(r.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold rounded-lg transition-colors"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
