'use client';

import React, { useState, useEffect } from 'react';
import { Bus, ClipboardList, CheckSquare, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { INITIAL_BUS_TRIPS, INITIAL_BUS_BOOKINGS, INITIAL_VEHICLES, INITIAL_EMPLOYEES } from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, BusTrip, BusBooking } from '@/types';
import { canTransitionTripStatus, getNextAllowedStatuses, getStatusBadgeColor } from '@/lib/services/tripStateMachine';
import { recordAssignmentAttempt } from '@/lib/services/driverAssignment';

export default function DriverDashboard() {
  const [user, setUser] = useState<Employee | null>(null);
  const [trips, setTrips] = useState<BusTrip[]>(INITIAL_BUS_TRIPS);
  const [bookings, setBookings] = useState<BusBooking[]>(INITIAL_BUS_BOOKINGS);
  const [checkedPassengers, setCheckedPassengers] = useState<Record<string, boolean>>({});

  const [pendingAssignmentOffer, setPendingAssignmentOffer] = useState<BusTrip | null>(trips[0] || null);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [tripsRes, bookingsRes] = await Promise.all([
        fetch('/api/trips').then(r => r.ok ? r.json() : null),
        fetch('/api/bookings').then(r => r.ok ? r.json() : null),
      ]);
      if (tripsRes && tripsRes.length > 0) {
        const formatted = tripsRes.map((t: any) => ({
          ...t,
          originLocationId: t.originLocationId,
          destinationLocationId: t.destinationLocationId,
          departureTime: typeof t.departureTime === 'string' ? t.departureTime : new Date(t.departureTime).toISOString(),
          arrivalTime: typeof t.arrivalTime === 'string' ? t.arrivalTime : new Date(t.arrivalTime).toISOString(),
        }));
        setTrips(formatted);
        setPendingAssignmentOffer(formatted[0] || null);
      }
      if (bookingsRes && bookingsRes.length > 0) {
        setBookings(bookingsRes);
      }
    } catch (e) {
      console.warn('Using local fallback for driver data');
    }
  };

  useEffect(() => {
    setUser(getActiveUser());
    loadData();
  }, []);

  if (!user) return null;

  const assignedVehicle = INITIAL_VEHICLES.find((v) => v.type === 'BUS');

  const handleAcceptAssignment = () => {
    if (!pendingAssignmentOffer) return;
    recordAssignmentAttempt(pendingAssignmentOffer.id, 'driver-1', pendingAssignmentOffer.vehicleId, 'ACCEPTED');
    setActionMessage(`Assignment Accepted! Trip #${pendingAssignmentOffer.id.slice(0, 6)} is ready for boarding.`);
    setPendingAssignmentOffer(null);
  };

  const handleRejectAssignment = () => {
    if (!pendingAssignmentOffer) return;
    recordAssignmentAttempt(pendingAssignmentOffer.id, 'driver-1', pendingAssignmentOffer.vehicleId, 'REJECTED', rejectionReason || 'Driver off-duty');
    setActionMessage(`Assignment Rejected. System is automatically finding next available candidate driver...`);
    setRejectionModalVisible(false);
    setPendingAssignmentOffer(null);
  };

  const handleAdvanceTripState = async (tripId: string, nextStatus: any) => {
    try {
      const res = await fetch('/api/trips', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, status: nextStatus }),
      });
      if (res.ok) {
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, status: nextStatus as any } : t))
        );
        setActionMessage(`Trip status successfully updated to ${nextStatus} in live database!`);
      } else {
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, status: nextStatus as any } : t))
        );
        setActionMessage(`Trip status updated locally to ${nextStatus}`);
      }
    } catch (e) {
      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, status: nextStatus as any } : t))
      );
    }
  };

  const togglePassengerCheckIn = (bookingId: string) => {
    setCheckedPassengers((prev) => ({ ...prev, [bookingId]: !prev[bookingId] }));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-[#1C355E] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Driver Command Console • AGL Fleet
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Driver Console: {user.firstName} {user.lastName}</h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Assigned Bus: <span className="font-bold underline">{assignedVehicle?.make} {assignedVehicle?.model} ({assignedVehicle?.registrationNumber})</span>
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold text-xs rounded-2xl animate-in fade-in">
          ✅ {actionMessage}
        </div>
      )}

      {/* Assignment Offer Notification Banner */}
      {pendingAssignmentOffer && (
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-3xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <span className="text-xs font-black text-amber-900 uppercase tracking-wider">NEW TRIP ASSIGNMENT OFFERED</span>
            </div>
            <span className="text-xs font-extrabold text-slate-500">Attempt #1</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-amber-200">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Route</p>
              <p className="text-sm font-black text-[#1C355E]">AGL HQ ➔ WMT Port</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Departure Time</p>
              <p className="text-sm font-black text-[#1C355E]">{new Date(pendingAssignmentOffer.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Bus</p>
              <p className="text-sm font-black text-[#1C355E]">{assignedVehicle?.registrationNumber}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAcceptAssignment}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
            >
              ACCEPT ASSIGNMENT
            </button>
            <button
              onClick={() => setRejectionModalVisible(true)}
              className="py-3 px-6 bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-xs rounded-xl border border-rose-300"
            >
              REJECT
            </button>
          </div>
        </div>
      )}

      {/* Driver Active Trips Action Workflows */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#1C355E]">Active Trips & Controlled State Action Controls</h2>

        <div className="grid grid-cols-1 gap-4">
          {trips.map((t) => {
            const nextStatuses = getNextAllowedStatuses(t.status);
            const tripBookings = bookings.filter((b) => b.busTripId === t.id);

            return (
              <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-black border ${getStatusBadgeColor(t.status)}`}>
                        {t.status}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {new Date(t.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Departure
                      </span>
                    </div>
                    <p className="text-base font-black text-[#1C355E] mt-1">AGL HQ ➔ Walvis Bay Container Terminal</p>
                  </div>

                  {/* Trip Controlled Action State Transition Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {t.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleAdvanceTripState(t.id, 'BOARDING')}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all animate-bounce"
                      >
                        START BOARDING 🚌
                      </button>
                    )}

                    {t.status === 'BOARDING' && (
                      <button
                        onClick={() => handleAdvanceTripState(t.id, 'EN_ROUTE')}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                      >
                        DEPART / START TRIP 🟢
                      </button>
                    )}

                    {t.status === 'EN_ROUTE' && (
                      <button
                        onClick={() => handleAdvanceTripState(t.id, 'ARRIVED')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                      >
                        ARRIVED 📍
                      </button>
                    )}

                    {t.status === 'ARRIVED' && (
                      <button
                        onClick={() => handleAdvanceTripState(t.id, 'EMPTYING')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                      >
                        EMPTY BUS 🚪
                      </button>
                    )}

                    {t.status === 'EMPTYING' && (
                      <button
                        onClick={() => handleAdvanceTripState(t.id, 'COMPLETED')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                      >
                        COMPLETE TRIP ✅
                      </button>
                    )}
                  </div>
                </div>

                {/* Passenger Manifest Check-In Checklist */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    Digital Passenger Manifest Check-in ({tripBookings.length} Bookings)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tripBookings.map((b) => {
                      const passenger = INITIAL_EMPLOYEES.find((e) => e.id === b.employeeId);
                      const isChecked = checkedPassengers[b.id];

                      return (
                        <div
                          key={b.id}
                          onClick={() => togglePassengerCheckIn(b.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={!!isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{passenger?.firstName} {passenger?.lastName || 'Rider'}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">Seat #{b.seatNumber || '01'} • {passenger?.riderCategory}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${isChecked ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
                            {isChecked ? 'BOARDED' : 'NOT BOARDED'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {rejectionModalVisible && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#1C355E]">Reject Assignment Reason</h3>
            <p className="text-xs text-slate-500">Provide a mandatory reason for rejecting this trip assignment:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Assigned vehicle requires refueling / Driver off-duty..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-900"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectionModalVisible(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectAssignment}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-extrabold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
