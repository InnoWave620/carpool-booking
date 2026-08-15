'use client';

import React, { useState } from 'react';
import { PoolVehicleRequest, Vehicle, Employee } from '@/types';
import { ShieldCheck, Camera, Fuel, Gauge, AlertTriangle, CheckCircle2, Upload } from 'lucide-react';
import { INITIAL_VEHICLES, INITIAL_EMPLOYEES } from '@/lib/store';

interface VehicleInspectionModalProps {
  request: PoolVehicleRequest;
  currentUser: Employee;
  onClose: () => void;
  onSubmitInspection: (params: {
    odometerReading: number;
    fuelLevelPercent: number;
    cleanlinessStatus: string;
    damageNotes: string;
    photoUrls: string[];
    passStatus: 'PASSED' | 'FLAGGED_NEEDS_SERVICE';
  }) => void;
}

export const VehicleInspectionModal: React.FC<VehicleInspectionModalProps> = ({
  request,
  currentUser,
  onClose,
  onSubmitInspection
}) => {
  const vehicle = INITIAL_VEHICLES.find(v => v.id === request.vehicleId) || INITIAL_VEHICLES[1];
  const requester = INITIAL_EMPLOYEES.find(e => e.id === request.requesterId);

  const [odometer, setOdometer] = useState<number>(vehicle.mileage + 145);
  const [fuelPercent, setFuelPercent] = useState<number>(90);
  const [cleanliness, setCleanliness] = useState<string>('EXCELLENT');
  const [damageNotes, setDamageNotes] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'
  ]);
  const [passStatus, setPassStatus] = useState<'PASSED' | 'FLAGGED_NEEDS_SERVICE'>('PASSED');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitInspection({
      odometerReading: odometer,
      fuelLevelPercent: fuelPercent,
      cleanlinessStatus: cleanliness,
      damageNotes,
      photoUrls: photos,
      passStatus,
    });
  };

  const addMockPhoto = () => {
    setPhotos(prev => [...prev, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600']);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1C355E] to-[#25467A] text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-400/20 text-[#EED58E] rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Fleet Inspection Console</h3>
                <p className="text-xs text-slate-300">Return Clearance • {vehicle.registrationNumber}</p>
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

        {/* Inspection Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Vehicle & User Summary Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-[#1C355E]">{vehicle.make} {vehicle.model}</p>
              <p className="text-slate-500 text-[11px]">Returned by {requester?.firstName} {requester?.lastName}</p>
            </div>
            <span className="text-[10px] font-extrabold bg-[#1C355E] text-white px-2.5 py-1 rounded-md uppercase">
              {vehicle.registrationNumber}
            </span>
          </div>

          {/* Odometer Reading */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-slate-500" /> End Odometer Reading (KM)
            </label>
            <input
              type="number"
              required
              value={odometer}
              onChange={(e) => setOdometer(Number(e.target.value))}
              className="w-full text-sm font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1C355E]"
            />
          </div>

          {/* Fuel Level Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5 text-slate-500" /> Fuel Level</span>
              <span className="text-[#1C355E] font-black">{fuelPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={fuelPercent}
              onChange={(e) => setFuelPercent(Number(e.target.value))}
              className="w-full accent-[#1C355E]"
            />
          </div>

          {/* Cleanliness Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Vehicle Cleanliness
            </label>
            <div className="flex space-x-2">
              {['EXCELLENT', 'ACCEPTABLE', 'NEEDS_CLEANING'].map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setCleanliness(status)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    cleanliness === status
                      ? 'bg-[#1C355E] text-white border-[#1C355E]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Camera / Photo Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-slate-500" /> Inspection Photos ({photos.length})</span>
              <button 
                type="button" 
                onClick={addMockPhoto}
                className="text-[11px] text-[#1C355E] font-bold hover:underline"
              >
                + Snap Photo
              </button>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {photos.map((url, idx) => (
                <img key={idx} src={url} alt="Inspection" className="w-full h-16 rounded-xl object-cover border border-slate-200" />
              ))}
              <button
                type="button"
                onClick={addMockPhoto}
                className="h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#1C355E] flex flex-col items-center justify-center text-slate-400 hover:text-[#1C355E] transition-colors"
              >
                <Upload className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] font-bold">Add Image</span>
              </button>
            </div>
          </div>

          {/* Pass / Flag Status Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pass / Service Assessment
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setPassStatus('PASSED')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1 transition-all ${
                  passStatus === 'PASSED'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Passed (Unlock Fleet)</span>
              </button>

              <button
                type="button"
                onClick={() => setPassStatus('FLAGGED_NEEDS_SERVICE')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1 transition-all ${
                  passStatus === 'FLAGGED_NEEDS_SERVICE'
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Flag Maintenance</span>
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#EED58E] to-amber-300 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md transition-all"
            >
              Complete Inspection & Confirm
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
