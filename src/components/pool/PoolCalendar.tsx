'use client';

import React, { useState } from 'react';
import { Vehicle, PoolVehicleRequest, Employee } from '@/types';
import { Car, Calendar, Plus, CheckCircle2, Clock, ShieldAlert, Check } from 'lucide-react';
import { RequestVehicleModal } from './RequestVehicleModal';
import { INITIAL_EMPLOYEES } from '@/lib/store';

interface PoolCalendarProps {
  vehicles: Vehicle[];
  requests: PoolVehicleRequest[];
  user: Employee;
  onRequestVehicle: (params: {
    vehicleId: string;
    purpose: string;
    startDateTime: string;
    endDateTime: string;
  }) => void;
  onDeclareReturn: (requestId: string) => void;
}

export const PoolCalendar: React.FC<PoolCalendarProps> = ({
  vehicles,
  requests,
  user,
  onRequestVehicle,
  onDeclareReturn
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);

  const poolCars = vehicles.filter(v => v.type === 'POOL_CAR');

  return (
    <div className="space-y-6">
      
      {/* Pool Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300">
            Phase 2 • Pool Vehicle Fleet
          </span>
          <h2 className="text-xl font-extrabold text-[#1C355E] mt-1.5 flex items-center gap-2">
            <Car className="w-6 h-6 text-[#1C355E]" />
            Business Trip Vehicle Reservations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Book company vehicles for off-site business trips. Requires manager approval & fleet inspection upon return.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#EED58E] to-amber-300 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Request Pool Vehicle</span>
        </button>
      </div>

      {/* Vehicles & Availability Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {poolCars.map(car => {
          // Find requests for this vehicle
          const carRequests = requests.filter(r => r.vehicleId === car.id);
          const activeRequest = carRequests.find(r => r.status === 'APPROVED' || r.status === 'CHECKED_OUT');
          const isMyRequest = activeRequest && activeRequest.requesterId === user.id;

          return (
            <div key={car.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              
              {/* Vehicle Image Header */}
              <div className="relative h-44 bg-slate-900">
                <img 
                  src={car.imageUrl} 
                  alt={car.model}
                  className="w-full h-full object-cover opacity-90" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                
                {/* Status Badge Over Image */}
                <div className="absolute top-3 right-3">
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md ${
                    car.status === 'AVAILABLE' 
                      ? 'bg-emerald-500 text-white' 
                      : car.status === 'IN_USE'
                      ? 'bg-amber-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {car.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Car Title Overlay */}
                <div className="absolute bottom-3 left-4 text-white">
                  <h3 className="font-extrabold text-lg leading-tight">{car.make} {car.model} ({car.year})</h3>
                  <p className="text-xs text-amber-300 font-semibold">{car.registrationNumber} • {car.fuelType}</p>
                </div>
              </div>

              {/* Specs & Current Allocation Details */}
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Seats</p>
                    <p className="font-extrabold text-slate-900">{car.capacity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Mileage</p>
                    <p className="font-extrabold text-slate-900">{car.mileage.toLocaleString()} KM</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Site</p>
                    <p className="font-extrabold text-slate-900">HQ WB</p>
                  </div>
                </div>

                {/* Active Reservation Info if occupied */}
                {activeRequest ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center font-bold text-amber-900">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Currently Reserved
                      </span>
                      <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded uppercase">
                        {activeRequest.status}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px]">
                      Booked by <strong>{INITIAL_EMPLOYEES.find(e => e.id === activeRequest.requesterId)?.firstName}</strong> for: "{activeRequest.purpose}"
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Until {new Date(activeRequest.endDateTime).toLocaleDateString()} {new Date(activeRequest.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {/* Declare Return CTA if current user holds active reservation */}
                    {isMyRequest && (
                      <button
                        onClick={() => onDeclareReturn(activeRequest.id)}
                        className="mt-2 w-full py-1.5 bg-[#1C355E] text-white font-bold text-xs rounded-lg shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Declare Return & Initiate Inspection</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Ready for booking. No active reservation conflicts.</span>
                  </div>
                )}
              </div>

              {/* Card Footer CTA */}
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Request Reservation
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showRequestModal && (
        <RequestVehicleModal
          vehicles={poolCars}
          user={user}
          onClose={() => setShowRequestModal(false)}
          onSubmitRequest={(params) => {
            onRequestVehicle(params);
            setShowRequestModal(false);
          }}
        />
      )}
    </div>
  );
};
