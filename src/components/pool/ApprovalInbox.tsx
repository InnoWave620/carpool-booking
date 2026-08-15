'use client';

import React, { useState } from 'react';
import { PoolVehicleRequest, Employee } from '@/types';
import { CheckSquare, Check, X, Clock, Car, User, Calendar, AlertCircle } from 'lucide-react';
import { INITIAL_EMPLOYEES, INITIAL_VEHICLES } from '@/lib/store';

interface ApprovalInboxProps {
  requests: PoolVehicleRequest[];
  currentUser: Employee;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
}

export const ApprovalInbox: React.FC<ApprovalInboxProps> = ({
  requests,
  currentUser,
  onApproveRequest,
  onRejectRequest
}) => {
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const pendingRequests = requests.filter(r => r.status === 'PENDING_MANAGER_APPROVAL');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C355E] flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-500" />
            Manager Approval Inbox
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review business trip requests from direct reports. Approving locks the vehicle and updates the availability calendar.
          </p>
        </div>
        <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
          {pendingRequests.length} Pending Actions
        </span>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pendingRequests.length === 0 ? (
          <div className="md:col-span-2 py-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <CheckSquare className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-50" />
            Your manager inbox is clear! No pending vehicle requests.
          </div>
        ) : (
          pendingRequests.map(req => {
            const requester = INITIAL_EMPLOYEES.find(e => e.id === req.requesterId);
            const vehicle = INITIAL_VEHICLES.find(v => v.id === req.vehicleId);

            return (
              <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                
                {/* Requester Info */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={requester?.avatarUrl} 
                      alt={requester?.firstName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{requester?.firstName} {requester?.lastName}</p>
                      <p className="text-xs text-slate-500 font-semibold">{requester?.departmentId.toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Pending Review
                  </span>
                </div>

                {/* Requested Vehicle & Date Range */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-[#1C355E]" /> Vehicle:
                    </span>
                    <span className="font-bold text-slate-900">
                      {vehicle?.make} {vehicle?.model} ({vehicle?.registrationNumber})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#1C355E]" /> Duration:
                    </span>
                    <span className="font-bold text-[#1C355E]">
                      {new Date(req.startDateTime).toLocaleDateString()} → {new Date(req.endDateTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Business Purpose</p>
                  <p className="text-xs text-slate-800 font-medium mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{req.purpose}"
                  </p>
                </div>

                {/* Rejection input area if toggled */}
                {rejectingId === req.id && (
                  <div className="space-y-2 pt-2">
                    <input
                      type="text"
                      placeholder="Specify rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-red-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setRejectingId(null)}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onRejectRequest(req.id, rejectionReason || 'Request declined by manager');
                          setRejectingId(null);
                          setRejectionReason('');
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold"
                      >
                        Confirm Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {rejectingId !== req.id && (
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => onApproveRequest(req.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Reserve</span>
                    </button>

                    <button
                      onClick={() => setRejectingId(req.id)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Decline
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
