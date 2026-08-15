'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bus, 
  Car, 
  CheckSquare, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Users, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  INITIAL_BUS_TRIPS, 
  INITIAL_BUS_BOOKINGS, 
  INITIAL_VEHICLES, 
  INITIAL_POOL_REQUESTS 
} from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, BusTrip, BusBooking, Vehicle, PoolVehicleRequest } from '@/types';
import { logAuditEvent } from '@/lib/audit';
import { sendNotification } from '@/lib/notifications';

export default function DashboardPage() {
  const [user, setUser] = useState<Employee | null>(null);
  const [trips, setTrips] = useState<BusTrip[]>(INITIAL_BUS_TRIPS);
  const [bookings, setBookings] = useState<BusBooking[]>(INITIAL_BUS_BOOKINGS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [poolRequests, setPoolRequests] = useState<PoolVehicleRequest[]>(INITIAL_POOL_REQUESTS);

  useEffect(() => {
    const active = getActiveUser();
    setUser(active);

    // Auto Role-based router redirect
    if (active) {
      if (active.role === 'DRIVER') {
        window.location.href = '/driver/dashboard';
      } else if (active.role === 'MANAGER') {
        window.location.href = '/manager/dashboard';
      } else if (active.role === 'SUPER_ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/employee/dashboard';
      }
    }
  }, []);

  if (!user) return null;

  const myBusBookings = bookings.filter(b => b.employeeId === user.id);
  const myPoolRequests = poolRequests.filter(r => r.requesterId === user.id);

  const availableBuses = vehicles.filter(v => v.type === 'BUS' && v.status === 'AVAILABLE');
  const availableCars = vehicles.filter(v => v.type === 'POOL_CAR' && v.status === 'AVAILABLE');

  return (
    <div className="space-[#1C355E] space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="glass-card-navy p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#EED58E] mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>AGL Namibia • Walvis Bay Transport Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
            Centralized shuttle seat booking and pool vehicle fleet management platform.
          </p>

          {/* Quick Action CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/bus-schedule"
              className="px-5 py-2.5 bg-gradient-to-r from-[#EED58E] to-amber-300 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2"
            >
              <Bus className="w-4 h-4" />
              <span>Book Bus Seat (Phase 1)</span>
            </Link>

            <Link
              href="/pool-vehicles"
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs rounded-xl backdrop-blur-md transition-all flex items-center space-x-2 border border-white/20"
            >
              <Car className="w-4 h-4 text-[#EED58E]" />
              <span>Request Pool Vehicle (Phase 2)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Next Shuttle</p>
            <p className="text-lg font-black text-[#1C355E] mt-0.5">08:00 HQ → WMT</p>
            <p className="text-xs text-emerald-600 font-bold mt-0.5">16 Seats Left</p>
          </div>
          <div className="p-3 bg-amber-100 text-[#1C355E] rounded-2xl">
            <Bus className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pool Vehicles</p>
            <p className="text-lg font-black text-[#1C355E] mt-0.5">{availableCars.length} Cars Available</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Toyota Hilux & Polo</p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <Car className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">My Active Bookings</p>
            <p className="text-lg font-black text-[#1C355E] mt-0.5">{myBusBookings.length} Bus Seats</p>
            <p className="text-xs text-amber-600 font-bold mt-0.5">Auto-Approved</p>
          </div>
          <div className="p-3 bg-blue-100 text-[#1C355E] rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Manager Inbox</p>
            <p className="text-lg font-black text-[#1C355E] mt-0.5">{poolRequests.filter(r => r.status === 'PENDING_MANAGER_APPROVAL').length} Pending</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Trip approvals</p>
          </div>
          <div className="p-3 bg-purple-100 text-purple-800 rounded-2xl">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Upcoming Shuttles & My Active Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Shuttle Departure Schedule */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-[#1C355E]">Today's Company Bus Timetable</h3>
              <p className="text-xs text-slate-500">Fixed shuttle windows between HQ, WMT Container Terminal and Customs</p>
            </div>
            <Link href="/bus-schedule" className="text-xs font-bold text-[#1C355E] hover:underline flex items-center gap-1">
              <span>View Full Schedule</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {trips.slice(0, 4).map(trip => {
              const depTime = new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={trip.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-[#1C355E]">
                      <span className="text-xs font-extrabold">{depTime}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {trip.originLocationId === 'loc-1' ? 'HQ Walvis Bay' : 'WMT Terminal'} → {trip.destinationLocationId === 'loc-2' ? 'WMT Container Terminal' : 'Customs Office'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Bus {trip.vehicle?.registrationNumber || 'N 142-991 WB'} • Driver: Johannes Nangolo
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      {trip.availableSeats} Seats
                    </span>
                    <Link
                      href="/bus-schedule"
                      className="px-3 py-1.5 bg-[#1C355E] text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Quick Status & My Bookings Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#1C355E]">My Active Transport</h3>
            <p className="text-xs text-slate-500">Your upcoming seat reservations & pool requests</p>
          </div>

          <div className="space-y-3">
            {myBusBookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active bus bookings.</p>
            ) : (
              myBusBookings.map(b => (
                <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1C355E]">Shuttle Seat Reserved ({b.passengerCount})</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">08:00 HQ → WMT Container Terminal</p>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/my-bookings"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
            >
              <span>Manage All My Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
