'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle, Camera, Wrench, X } from 'lucide-react';
import { INITIAL_VEHICLES, INITIAL_POOL_REQUESTS, INITIAL_INSPECTIONS } from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, Vehicle, VehicleInspection, PoolVehicleRequest } from '@/types';
import { getVehicleStatusBadge } from '@/lib/services/vehicleReservation';

export default function InspectorDashboard() {
  const [user, setUser] = useState<Employee | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [poolRequests, setPoolRequests] = useState<PoolVehicleRequest[]>(INITIAL_POOL_REQUESTS);
  const [inspections, setInspections] = useState<VehicleInspection[]>(INITIAL_INSPECTIONS);

  // Active Inspection Form Modal State
  const [activeInspectionVehicle, setActiveInspectionVehicle] = useState<Vehicle | null>(null);
  const [odometer, setOdometer] = useState(45200);
  const [fuelPercent, setFuelPercent] = useState(85);
  const [cleanliness, setCleanliness] = useState('Clean & Sanitized');
  const [damageNotes, setDamageNotes] = useState('');
  const [passDecision, setPassDecision] = useState<'PASSED' | 'FAILED' | 'REQUIRES_ATTENTION'>('PASSED');

  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [vehRes, inspRes] = await Promise.all([
        fetch('/api/vehicles').then(r => r.ok ? r.json() : null),
        fetch('/api/inspections').then(r => r.ok ? r.json() : null),
      ]);
      if (vehRes && vehRes.length > 0) {
        setVehicles(vehRes);
      }
      if (inspRes && inspRes.length > 0) {
        const formatted = inspRes.map((i: any) => ({
          ...i,
          inspectedAt: typeof i.inspectedAt === 'string' ? i.inspectedAt : new Date(i.inspectedAt).toISOString(),
        }));
        setInspections(formatted);
      }
    } catch (e) {
      console.warn('Using local fallback for inspections');
    }
  };

  useEffect(() => {
    setUser(getActiveUser());
    loadData();
  }, []);

  if (!user) return null;

  // Find vehicles that are RETURNED or requiring inspection
  const returnedVehiclesPendingInspection = vehicles.filter(
    (v) => v.status === 'RETURNED' || v.status === 'INSPECTION_REQUIRED' || v.status === 'AVAILABLE'
  );

  const handleCompleteInspection = async () => {
    if (!activeInspectionVehicle) return;

    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: activeInspectionVehicle.id,
          inspectorId: user.id,
          odometerReading: odometer,
          fuelLevelPercent: fuelPercent,
          passStatus: passDecision,
          damageNotes,
        }),
      });

      const nextVehicleStatus = passDecision === 'PASSED' ? 'AVAILABLE' : 'UNDER_MAINTENANCE';

      if (res.ok) {
        const newInsp = await res.json();
        setInspections([newInsp, ...inspections]);
        setVehicles((prev) =>
          prev.map((v) => (v.id === activeInspectionVehicle.id ? { ...v, status: nextVehicleStatus, mileage: odometer } : v))
        );
        setNotification(
          `Inspection Completed in Database for ${activeInspectionVehicle.registrationNumber}! Result: ${passDecision}. Vehicle state set to ${nextVehicleStatus}.`
        );
        loadData();
      } else {
        setVehicles((prev) =>
          prev.map((v) => (v.id === activeInspectionVehicle.id ? { ...v, status: nextVehicleStatus, mileage: odometer } : v))
        );
        setNotification(
          `Inspection Completed locally for ${activeInspectionVehicle.registrationNumber}!`
        );
      }
    } catch (e) {
      setNotification(`Inspection completed.`);
    }

    setActiveInspectionVehicle(null);
    setDamageNotes('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1C355E] via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Vehicle Quality Control • Inspector Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Inspector Portal: {user.firstName} {user.lastName}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Perform post-return inspections & enforce vehicle availability quality gates.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold text-xs rounded-2xl animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" /> {notification}
        </div>
      )}

      {/* SECTION 1: Pending Returned Inspections Queue */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#1C355E]" />
            <h2 className="text-base font-black text-[#1C355E]">Vehicle Post-Return Inspection Queue</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {returnedVehiclesPendingInspection.map((v) => {
            const badge = getVehicleStatusBadge(v.status);

            return (
              <div key={v.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Fleet #{v.registrationNumber}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.badgeClass}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-base font-black text-[#1C355E]">{v.make} {v.model}</p>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">Odometer: {v.mileage} km • {v.fuelType}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveInspectionVehicle(v)}
                  className="w-full py-2.5 bg-[#1C355E] hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#EED58E]" />
                  <span>Perform Inspection</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Completed Inspection Log History */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-black text-[#1C355E]">Completed Inspection Audit Logs</h2>

        <div className="divide-y divide-slate-100">
          {inspections.map((insp) => (
            <div key={insp.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-[#1C355E]">Post-Return Inspection #{insp.id.slice(0, 6)}</p>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                  Odometer: {insp.odometerReading} km • Fuel: {insp.fuelLevelPercent}% • {insp.cleanlinessStatus}
                </p>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${insp.passStatus === 'PASSED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                {insp.passStatus}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Perform Inspection Modal */}
      {activeInspectionVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#1C355E]">Vehicle Post-Return Inspection</h3>
                <p className="text-xs text-slate-500 font-bold">{activeInspectionVehicle.make} {activeInspectionVehicle.model} ({activeInspectionVehicle.registrationNumber})</p>
              </div>
              <button onClick={() => setActiveInspectionVehicle(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold flex items-center gap-1">
                <X className="w-4 h-4" /> Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-700 uppercase">Odometer Reading (km)</label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(Number(e.target.value))}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-700 uppercase">Fuel Level (%)</label>
                  <input
                    type="number"
                    value={fuelPercent}
                    onChange={(e) => setFuelPercent(Number(e.target.value))}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-700 uppercase">Inspection Gate Decision</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button
                    onClick={() => setPassDecision('PASSED')}
                    className={`py-2 rounded-xl text-xs font-extrabold border ${passDecision === 'PASSED' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                  >
                    PASSED
                  </button>
                  <button
                    onClick={() => setPassDecision('FAILED')}
                    className={`py-2 rounded-xl text-xs font-extrabold border ${passDecision === 'FAILED' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                  >
                    FAILED
                  </button>
                  <button
                    onClick={() => setPassDecision('REQUIRES_ATTENTION')}
                    className={`py-2 rounded-xl text-xs font-extrabold border ${passDecision === 'REQUIRES_ATTENTION' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                  >
                    ATTENTION
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-700 uppercase">Damage & Inspection Notes</label>
                <textarea
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  placeholder="Record any exterior scratches, tire condition, or interior cleanliness notes..."
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveInspectionVehicle(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteInspection}
                className="flex-1 py-2.5 bg-[#1C355E] hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-md"
              >
                Submit Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
