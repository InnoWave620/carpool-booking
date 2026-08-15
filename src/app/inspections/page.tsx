'use client';

import React, { useState, useEffect } from 'react';
import { VehicleInspectionModal } from '@/components/pool/VehicleInspectionModal';
import { 
  INITIAL_POOL_REQUESTS, 
  INITIAL_VEHICLES, 
  INITIAL_INSPECTIONS 
} from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, PoolVehicleRequest, VehicleInspection, Vehicle } from '@/types';
import { ShieldCheck, CheckCircle2, AlertTriangle, Car, FileText } from 'lucide-react';
import { logAuditEvent } from '@/lib/audit';

export default function InspectionsPage() {
  const [user, setUser] = useState<Employee | null>(null);
  const [requests, setRequests] = useState<PoolVehicleRequest[]>(INITIAL_POOL_REQUESTS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [inspections, setInspections] = useState<VehicleInspection[]>(INITIAL_INSPECTIONS);
  const [activeRequestForInspection, setActiveRequestForInspection] = useState<PoolVehicleRequest | null>(null);

  useEffect(() => {
    setUser(getActiveUser());
  }, []);

  if (!user) return null;

  // Requests that are returned and awaiting inspection
  const returnedRequests = requests.filter(r => r.status === 'RETURNED');

  const handleSubmitInspection = (params: {
    odometerReading: number;
    fuelLevelPercent: number;
    cleanlinessStatus: string;
    damageNotes: string;
    photoUrls: string[];
    passStatus: 'PASSED' | 'FLAGGED_NEEDS_SERVICE';
  }) => {
    if (!activeRequestForInspection) return;

    const newInspection: VehicleInspection = {
      id: `inspect-${Date.now()}`,
      poolVehicleRequestId: activeRequestForInspection.id,
      vehicleId: activeRequestForInspection.vehicleId || 'veh-pool-1',
      inspectorId: user.id,
      inspectionType: 'POST_RETURN',
      odometerReading: params.odometerReading,
      fuelLevelPercent: params.fuelLevelPercent,
      cleanlinessStatus: params.cleanlinessStatus,
      damageNotes: params.damageNotes,
      photoUrls: params.photoUrls,
      passStatus: params.passStatus,
      inspectedAt: new Date().toISOString(),
    };

    setInspections(prev => [newInspection, ...prev]);

    // Update vehicle status & mileage
    const newVehicleStatus = params.passStatus === 'PASSED' ? 'AVAILABLE' : 'UNDER_MAINTENANCE';
    setVehicles(prev => prev.map(v => v.id === newInspection.vehicleId ? {
      ...v,
      status: newVehicleStatus,
      mileage: params.odometerReading
    } : v));

    // Mark request as COMPLETED
    setRequests(prev => prev.map(r => r.id === activeRequestForInspection.id ? { ...r, status: 'CHECKED_OUT' } : r));

    logAuditEvent({
      performerId: user.id,
      action: 'VEHICLE_INSPECTION_COMPLETED',
      entityType: 'VehicleInspection',
      entityId: newInspection.id,
      metadata: params
    });

    setActiveRequestForInspection(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C355E] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Fleet Return Inspection Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet Admin clearance protocol. Verify odometer reading, fuel level, cleanliness, damage photos before unlocking vehicle back to fleet pool.
          </p>
        </div>

        <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
          {returnedRequests.length} Vehicles Awaiting Clearance
        </span>
      </div>

      {/* Returned Vehicles Awaiting Inspection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {returnedRequests.length === 0 ? (
          <div className="md:col-span-2 py-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-50" />
            All returned pool vehicles have passed inspection! No pending clearances.
          </div>
        ) : (
          returnedRequests.map(r => {
            const vehicle = vehicles.find(v => v.id === r.vehicleId);
            return (
              <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <img src={vehicle?.imageUrl} alt={vehicle?.model} className="w-12 h-9 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{vehicle?.make} {vehicle?.model}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{vehicle?.registrationNumber}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full uppercase">
                    Returned - Pending Inspection
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <p className="font-semibold text-slate-700">Trip Purpose: "{r.purpose}"</p>
                </div>

                <button
                  onClick={() => setActiveRequestForInspection(r)}
                  className="w-full py-2.5 bg-gradient-to-r from-[#EED58E] to-amber-300 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Inspect & Release Vehicle</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {activeRequestForInspection && (
        <VehicleInspectionModal
          request={activeRequestForInspection}
          currentUser={user}
          onClose={() => setActiveRequestForInspection(null)}
          onSubmitInspection={handleSubmitInspection}
        />
      )}

    </div>
  );
}
