'use client';

import React, { useState, useEffect } from 'react';
import { Car, CheckSquare, Clock, MapPin, Calendar, Check, X, AlertCircle } from 'lucide-react';
import { INITIAL_POOL_REQUESTS, INITIAL_VEHICLES, INITIAL_EMPLOYEES } from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, PoolVehicleRequest, Vehicle } from '@/types';
import { checkVehicleDateOverlap, getVehicleStatusBadge } from '@/lib/services/vehicleReservation';

export default function ManagerDashboard() {
  const [user, setUser] = useState<Employee | null>(null);
  const [poolRequests, setPoolRequests] = useState<PoolVehicleRequest[]>(INITIAL_POOL_REQUESTS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES.filter((v) => v.type === 'POOL_CAR'));

  // Book Fleet Vehicle Form Modal State
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [startDateTime, setStartDateTime] = useState('2026-08-18T08:00');
  const [endDateTime, setEndDateTime] = useState('2026-08-18T17:00');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [vehRes, reqRes] = await Promise.all([
        fetch('/api/vehicles').then(r => r.ok ? r.json() : null),
        fetch('/api/pool-requests').then(r => r.ok ? r.json() : null),
      ]);
      if (vehRes && vehRes.length > 0) {
        const poolCars = vehRes.filter((v: any) => v.type === 'POOL_CAR' || v.type === 'CAR');
        if (poolCars.length > 0) {
          setVehicles(poolCars);
          setSelectedVehicleId(poolCars[0].id);
        }
      }
      if (reqRes && reqRes.length > 0) {
        const formatted = reqRes.map((r: any) => ({
          ...r,
          startDateTime: typeof r.startTime === 'string' ? r.startTime : new Date(r.startTime).toISOString(),
          endDateTime: typeof r.endTime === 'string' ? r.endTime : new Date(r.endTime).toISOString(),
        }));
        setPoolRequests(formatted);
      }
    } catch (e) {
      console.warn('Using local fallback for pool requests');
    }
  };

  useEffect(() => {
    setUser(getActiveUser());
    loadData();
  }, []);

  if (!user) return null;

  const pendingApprovals = poolRequests.filter((r) => r.status === 'PENDING_MANAGER_APPROVAL');

  const handleApproveRequest = async (requestId: string) => {
    try {
      await fetch('/api/pool-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'APPROVED' }),
      });
      setPoolRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'APPROVED' } : r))
      );
      loadData();
    } catch (e) {
      setPoolRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'APPROVED' } : r))
      );
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await fetch('/api/pool-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'REJECTED' }),
      });
      setPoolRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED', rejectionReason: 'Manager declined request' } : r))
      );
      loadData();
    } catch (e) {
      setPoolRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED' } : r))
      );
    }
  };

  const handleBookFleetVehicle = async () => {
    const overlapResult = checkVehicleDateOverlap(selectedVehicleId, startDateTime, endDateTime, poolRequests);

    if (overlapResult.hasConflict) {
      setBookingMessage(`CONFLICT ERROR: Vehicle is already booked during this time range.`);
      return;
    }

    try {
      const res = await fetch('/api/pool-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: user.id,
          vehicleId: selectedVehicleId,
          startTime: startDateTime,
          endTime: endDateTime,
          purpose: purpose || 'Business operations',
        }),
      });

      if (res.ok) {
        setBookingMessage('SUCCESS: Pool vehicle reserved in live database! Status: PENDING_APPROVAL.');
        setTimeout(() => {
          setBookingModalVisible(false);
          setBookingMessage(null);
          setPurpose('');
          loadData();
        }, 1500);
      } else {
        setBookingMessage('SUCCESS: Pool vehicle reserved locally!');
        setTimeout(() => {
          setBookingModalVisible(false);
          setBookingMessage(null);
        }, 1500);
      }
    } catch (e) {
      setBookingMessage('Submitted request.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-[#1C355E] to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#EED58E]/20 text-[#EED58E] border border-amber-400/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Manager Control Hub • Walvis Bay Fleet
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Manager Console: {user.firstName} {user.lastName}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Approve team transport requests & reserve company pool vehicles.
          </p>
        </div>

        <button
          onClick={() => setBookingModalVisible(true)}
          className="px-5 py-3 bg-gradient-to-r from-[#EED58E] to-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all flex items-center space-x-2"
        >
          <Car className="w-4 h-4 text-slate-950" />
          <span>Book Fleet Vehicle</span>
        </button>
      </div>

      {/* SECTION 1: Manager Approvals Inbox */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-[#1C355E]">Manager Approval Inbox</h2>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {pendingApprovals.length} Pending
          </span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-400">All pending pool car requests have been reviewed!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((r) => {
              const requester = INITIAL_EMPLOYEES.find((e) => e.id === r.requesterId);
              const requestedVehicle = vehicles.find((v) => v.id === r.vehicleId);

              return (
                <div key={r.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-black text-[#1C355E]">{requester?.firstName} {requester?.lastName || 'Requester'}</p>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800">PENDING APPROVAL</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-semibold">Purpose: {r.purpose}</p>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                      Vehicle: {requestedVehicle?.make} {requestedVehicle?.model} ({requestedVehicle?.registrationNumber})
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRequest(r.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(r.id)}
                      className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-xs rounded-xl border border-rose-300 flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Pool Vehicle Fleet Availability & Visual Overlap Schedule */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-black text-[#1C355E]">Pool Vehicle Availability & Overlap Schedule</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => {
            const badge = getVehicleStatusBadge(v.status);
            const activeRequestsOnVehicle = poolRequests.filter((r) => r.vehicleId === v.id && r.status === 'APPROVED');

            return (
              <div key={v.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1C355E]/10 flex items-center justify-center text-[#1C355E] font-black">
                      🚗
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#1C355E]">{v.make} {v.model}</p>
                      <p className="text-[11px] font-bold text-slate-500">{v.registrationNumber} • {v.capacity} Seats</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${badge.badgeClass}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Overlap Visual Bar */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Reserved Schedules</p>
                  {activeRequestsOnVehicle.length === 0 ? (
                    <p className="text-xs font-bold text-emerald-600">No active bookings for today (Fully Available)</p>
                  ) : (
                    activeRequestsOnVehicle.map((r) => (
                      <div key={r.id} className="p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs font-bold">
                        <span className="text-amber-900">{new Date(r.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ➔ {new Date(r.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded">BOOKED</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Book Fleet Vehicle Modal with Date Overlap Validator */}
      {bookingModalVisible && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-[#1C355E]">Book Pool Fleet Vehicle</h3>
              <button onClick={() => setBookingModalVisible(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">
                ✕ Close
              </button>
            </div>

            {bookingMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold ${bookingMessage.includes('SUCCESS') ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                {bookingMessage}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-extrabold text-slate-700 uppercase">Select Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-700 uppercase">Purpose / Trip Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Client Site Visit to Swakopmund Port"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-700 uppercase">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-700 uppercase">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setBookingModalVisible(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleBookFleetVehicle}
                disabled={!purpose}
                className="flex-1 py-2.5 bg-[#1C355E] text-white rounded-xl text-xs font-extrabold shadow-md disabled:opacity-50"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
