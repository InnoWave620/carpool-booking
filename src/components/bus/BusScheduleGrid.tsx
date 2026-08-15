'use client';

import React, { useState } from 'react';
import { BusTrip, BusBooking, Employee } from '@/types';
import { Bus, Clock, MapPin, Users, CheckCircle2, ShieldAlert, ChevronRight, User } from 'lucide-react';
import { SeatBookingModal } from './SeatBookingModal';

interface BusScheduleGridProps {
  trips: BusTrip[];
  bookings: BusBooking[];
  user: Employee;
  onBookSeat: (tripId: string, passengerCount: number) => void;
}

export const BusScheduleGrid: React.FC<BusScheduleGridProps> = ({
  trips,
  bookings,
  user,
  onBookSeat
}) => {
  const [selectedTrip, setSelectedTrip] = useState<BusTrip | null>(null);
  const [filterRoute, setFilterRoute] = useState<string>('ALL');

  const filteredTrips = trips.filter(t => {
    if (filterRoute === 'ALL') return true;
    if (filterRoute === 'HQ_WMT') return t.originLocationId === 'loc-1' && t.destinationLocationId === 'loc-2';
    if (filterRoute === 'WMT_HQ') return t.originLocationId === 'loc-2' && t.destinationLocationId === 'loc-1';
    if (filterRoute === 'HQ_CUSTOMS') return t.originLocationId === 'loc-1' && t.destinationLocationId === 'loc-3';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C355E] flex items-center gap-2">
            <Bus className="w-6 h-6 text-amber-500" />
            Company Bus Shuttle Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fixed departure windows between AGL HQ, WMT Container Terminal & Customs Office.
          </p>
        </div>

        {/* Route Filter Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'ALL', label: 'All Routes' },
            { id: 'HQ_WMT', label: 'HQ → WMT' },
            { id: 'WMT_HQ', label: 'WMT → HQ' },
            { id: 'HQ_CUSTOMS', label: 'HQ → Customs' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterRoute(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRoute === f.id
                  ? 'bg-[#1C355E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shuttle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTrips.map(trip => {
          const departureDate = new Date(trip.departureTime);
          const now = new Date();
          const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          const isAutoApproved = hoursUntilDeparture >= trip.cutoffHours;
          const isFull = trip.availableSeats === 0;

          // Check if current user already has a booking on this trip
          const userBooking = bookings.find(b => b.busTripId === trip.id && b.employeeId === user.id);

          return (
            <div 
              key={trip.id} 
              className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden ${
                isFull ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200/90'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1C355E] bg-slate-100 px-2.5 py-1 rounded-full">
                    {trip.vehicle?.registrationNumber || 'N 142-991 WB'}
                  </span>

                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isAutoApproved ? 'badge-auto-approved' : 'badge-pending-driver'
                  }`}>
                    {isAutoApproved ? '≥12h Auto-Approved' : '<12h Driver Review'}
                  </span>
                </div>

                {/* Route Header */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-[#1C355E]">
                      {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {departureDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-700 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <span>{trip.originLocation?.code || 'HQ'}</span>
                    <span className="text-amber-500">→</span>
                    <span>{trip.destinationLocation?.code || 'WMT'}</span>
                  </div>
                </div>
              </div>

              {/* Card Body - Seats & Driver info */}
              <div className="p-5 space-y-3 flex-1">
                
                {/* Available Seats Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Seats Available
                    </span>
                    <span className={`font-extrabold ${isFull ? 'text-red-600' : 'text-emerald-600'}`}>
                      {trip.availableSeats} of {trip.totalSeats} left
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isFull 
                          ? 'bg-red-500' 
                          : (trip.availableSeats / trip.totalSeats < 0.3) 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${((trip.totalSeats - trip.availableSeats) / trip.totalSeats) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Driver Info */}
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Driver: <strong className="text-slate-900">{trip.driver?.employee?.firstName || 'Johannes Nangolo'}</strong>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    Assigned
                  </span>
                </div>

                {/* User Active Booking Status if exists */}
                {userBooking && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      You have {userBooking.passengerCount} seat(s) booked
                    </span>
                    <span className="text-[10px] uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-extrabold">
                      {userBooking.status.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer - Booking CTA */}
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                  disabled={isFull}
                  onClick={() => setSelectedTrip(trip)}
                  className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all shadow-sm flex items-center justify-center space-x-2 ${
                    isFull
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : userBooking
                      ? 'bg-[#1C355E] text-white hover:bg-slate-800'
                      : 'bg-gradient-to-r from-[#EED58E] to-amber-300 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-200'
                  }`}
                >
                  <span>{isFull ? 'Shuttle Full' : userBooking ? 'Manage / Book Seats' : 'Book Shuttle Seat'}</span>
                  {!isFull && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {selectedTrip && (
        <SeatBookingModal
          trip={selectedTrip}
          user={user}
          onClose={() => setSelectedTrip(null)}
          onConfirmBooking={(count) => {
            onBookSeat(selectedTrip.id, count);
            setSelectedTrip(null);
          }}
        />
      )}
    </div>
  );
};
