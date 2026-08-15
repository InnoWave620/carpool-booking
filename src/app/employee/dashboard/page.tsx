'use client';

import React, { useState, useEffect } from 'react';
import { Bus, Calendar, MapPin, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { INITIAL_BUS_TRIPS, INITIAL_BUS_BOOKINGS, INITIAL_VEHICLES } from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, BusTrip, BusBooking } from '@/types';
import { VisualBusSeatMap } from '@/components/bus/VisualBusSeatMap';
import { validateAndBookSeat } from '@/lib/services/bookingConcurrency';
import { getStatusBadgeColor } from '@/lib/services/tripStateMachine';

export default function EmployeeDashboard() {
  const [user, setUser] = useState<Employee | null>(null);
  const [trips, setTrips] = useState<BusTrip[]>(INITIAL_BUS_TRIPS);
  const [bookings, setBookings] = useState<BusBooking[]>(INITIAL_BUS_BOOKINGS);

  const [selectedTrip, setSelectedTrip] = useState<BusTrip | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'UPCOMING' | 'MY_TRIPS'>('UPCOMING');

  useEffect(() => {
    setUser(getActiveUser());
  }, []);

  if (!user) return null;

  const currentActiveTrips = trips.filter((t) =>
    ['BOARDING', 'EN_ROUTE', 'ARRIVED', 'EMPTYING'].includes(t.status)
  );

  const myBookings = bookings.filter((b) => b.employeeId === user.id);

  const handleConfirmSeatBooking = () => {
    if (!selectedTrip || !selectedSeat) return;

    const result = validateAndBookSeat(selectedTrip.id, user.id, selectedSeat, bookings, trips);
    setBookingMessage(result.message);

    if (result.success && result.updatedBookings && result.updatedTrip) {
      setBookings(result.updatedBookings);
      setTrips((prev) => prev.map((t) => (t.id === result.updatedTrip!.id ? result.updatedTrip! : t)));
      setTimeout(() => {
        setSelectedTrip(null);
        setSelectedSeat(null);
        setBookingMessage(null);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#1C355E] to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-[#EED58E] mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>AGL Employee Rider Portal • Walvis Bay</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Hello, {user.firstName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
            Reserve shuttle bus seats with visual seat selection and track active trips in real time.
          </p>
        </div>
      </div>

      {/* Live Current Trips Banner */}
      {currentActiveTrips.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-slate-900 space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-black text-sm">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span>LIVE TRIPS IN PROGRESS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentActiveTrips.map((t) => (
              <div key={t.id} className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${getStatusBadgeColor(t.status)}`}>
                    {t.status}
                  </span>
                  <p className="text-xs font-black text-[#1C355E] mt-1">Shuttle #{t.vehicleId.slice(0, 6)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700">Dep: {new Date(t.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-[10px] font-bold text-emerald-600">{t.availableSeats} Seats Left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-3">
        {(['UPCOMING', 'MY_TRIPS', 'ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTabFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTabFilter === tab
                ? 'bg-[#1C355E] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'UPCOMING' ? 'Upcoming Bus Schedules' : tab === 'MY_TRIPS' ? `My Trips (${myBookings.length})` : 'All Trips'}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips
          .filter((t) => (activeTabFilter === 'UPCOMING' ? t.status === 'SCHEDULED' : true))
          .map((t) => {
            const isFull = t.availableSeats <= 0;
            const myBookingOnTrip = myBookings.find((b) => b.busTripId === t.id && b.status !== 'CANCELLED');

            return (
              <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border ${getStatusBadgeColor(t.status)}`}>
                      {isFull ? 'FULL' : t.status}
                    </span>
                    <span className="text-xs font-extrabold text-slate-400">12h Notice Window</span>
                  </div>

                  <div className="mt-3">
                    <p className="text-base font-black text-[#1C355E]">
                      {new Date(t.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Departure
                    </p>
                    <p className="text-xs font-bold text-slate-600 mt-1">
                      AGL HQ ➔ WMT Container Port
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Seats Remaining:</span>
                    <span className={`font-black ${isFull ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {t.availableSeats} / {t.totalSeats}
                    </span>
                  </div>

                  {myBookingOnTrip ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <p className="text-xs font-extrabold text-emerald-800 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Booked (Seat #{myBookingOnTrip.seatNumber || '01'})
                      </p>
                    </div>
                  ) : isFull ? (
                    <button disabled className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-extrabold text-xs cursor-not-allowed">
                      FULL — NO SEATS AVAILABLE
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedTrip(t);
                        setSelectedSeat(null);
                        setBookingMessage(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#1C355E] hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <Bus className="w-4 h-4 text-[#EED58E]" />
                      <span>Select Seat & Book</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Visual Bus Seat Map Selection Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#1C355E]">Select Your Seat</h3>
                <p className="text-xs text-slate-500 font-medium">Shuttle Departure: {new Date(selectedTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <button onClick={() => setSelectedTrip(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xs">
                ✕ Close
              </button>
            </div>

            {bookingMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold text-center ${bookingMessage.includes('SUCCESS') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {bookingMessage}
              </div>
            )}

            {/* Visual Top-Down Bus Seat Map */}
            <VisualBusSeatMap
              trip={selectedTrip}
              bookings={bookings}
              selectedSeat={selectedSeat}
              onSelectSeat={(seatNum) => setSelectedSeat(seatNum)}
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedTrip(null)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSeatBooking}
                disabled={!selectedSeat}
                className="flex-1 py-3 bg-gradient-to-r from-[#EED58E] to-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
              >
                Confirm Seat #{selectedSeat || '--'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
