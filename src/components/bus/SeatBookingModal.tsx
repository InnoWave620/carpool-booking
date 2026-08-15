'use client';

import React, { useState } from 'react';
import { BusTrip, Employee } from '@/types';
import { Bus, Clock, MapPin, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SeatBookingModalProps {
  trip: BusTrip;
  user: Employee;
  onClose: () => void;
  onConfirmBooking: (passengerCount: number) => void;
}

export const SeatBookingModal: React.FC<SeatBookingModalProps> = ({
  trip,
  user,
  onClose,
  onConfirmBooking
}) => {
  const [seatCount, setSeatCount] = useState<number>(1);

  // Cutoff calculation logic (12h or 24h)
  const departureDate = new Date(trip.departureTime);
  const now = new Date();
  const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isAutoApproved = hoursUntilDeparture >= trip.cutoffHours;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1C355E] to-[#25467A] text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-400/20 text-[#EED58E] rounded-xl">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Reserve Shuttle Seats</h3>
                <p className="text-xs text-slate-300">AGL Company Bus • Walvis Bay</p>
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Trip Summary Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Route</span>
              <span className="text-xs font-semibold text-[#1C355E] bg-slate-200/60 px-2 py-0.5 rounded-full">
                {trip.vehicle?.registrationNumber || 'N 142-991 WB'}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-slate-900">
              <div className="text-center font-bold text-sm text-[#1C355E] min-w-[70px]">
                {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex-1 flex items-center justify-center space-x-2">
                <span className="font-semibold text-xs text-slate-700">{trip.originLocation?.name || 'HQ'}</span>
                <span className="text-amber-500 font-bold">→</span>
                <span className="font-semibold text-xs text-slate-700">{trip.destinationLocation?.name || 'Destination'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Departs in {Math.max(0, Math.round(hoursUntilDeparture))} hours
              </span>
              <span className="font-bold text-emerald-600">
                {trip.availableSeats} seats remaining
              </span>
            </div>
          </div>

          {/* Rule Notice Badge (Transparent 12h/24h logic) */}
          <div className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${
            isAutoApproved 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {isAutoApproved ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-xs">
                {isAutoApproved ? 'Instant Auto-Approval Eligible' : 'Requires Driver Approval (< 12h cutoff)'}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                {isAutoApproved 
                  ? `Booked ≥ ${trip.cutoffHours} hours before departure. Seat will be confirmed immediately.`
                  : `Booked within ${trip.cutoffHours} hours of departure. Driver will receive a notification to approve or decline.`
                }
              </p>
            </div>
          </div>

          {/* Seat Counter Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Number of Seats Requested
            </label>
            <div className="flex items-center space-x-3">
              {[1, 2, 3, 4].map(count => (
                <button
                  key={count}
                  disabled={count > trip.availableSeats}
                  onClick={() => setSeatCount(count)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                    seatCount === count
                      ? 'bg-[#1C355E] text-white border-[#1C355E] shadow-md'
                      : count > trip.availableSeats
                      ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {count} {count === 1 ? 'Seat' : 'Seats'}
                </button>
              ))}
            </div>
          </div>

          {/* Passenger Info Note */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
            Booking on behalf of <strong className="text-slate-800">{user.firstName} {user.lastName}</strong> ({user.departmentId.toUpperCase()}). Drivers can see passenger manifests.
          </div>

        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmBooking(seatCount)}
            className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#EED58E] to-amber-300 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <span>Confirm Booking ({seatCount})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
