'use client';

import React, { useState, useEffect } from 'react';
import { ApprovalInbox } from '@/components/pool/ApprovalInbox';
import { 
  INITIAL_POOL_REQUESTS, 
  INITIAL_VEHICLES 
} from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, PoolVehicleRequest, Vehicle } from '@/types';
import { logAuditEvent } from '@/lib/audit';
import { sendNotification } from '@/lib/notifications';

export default function ApprovalsPage() {
  const [user, setUser] = useState<Employee | null>(null);
  const [requests, setRequests] = useState<PoolVehicleRequest[]>(INITIAL_POOL_REQUESTS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);

  useEffect(() => {
    setUser(getActiveUser());
  }, []);

  if (!user) return null;

  const handleApprove = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED' } : r));
    
    const targetReq = requests.find(r => r.id === requestId);
    if (targetReq?.vehicleId) {
      setVehicles(prev => prev.map(v => v.id === targetReq.vehicleId ? { ...v, status: 'IN_USE' } : v));
    }

    logAuditEvent({
      performerId: user.id,
      action: 'POOL_REQUEST_APPROVED_BY_MANAGER',
      entityType: 'PoolVehicleRequest',
      entityId: requestId
    });

    if (targetReq) {
      sendNotification({
        recipientId: targetReq.requesterId,
        title: 'Vehicle Request Approved!',
        body: `Your pool vehicle request has been approved by ${user.firstName}. Car is reserved.`,
        type: 'POOL_REQUEST'
      });
    }
  };

  const handleReject = (requestId: string, reason: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'REJECTED', rejectionReason: reason } : r));
    
    logAuditEvent({
      performerId: user.id,
      action: 'POOL_REQUEST_REJECTED_BY_MANAGER',
      entityType: 'PoolVehicleRequest',
      entityId: requestId,
      metadata: { reason }
    });

    const targetReq = requests.find(r => r.id === requestId);
    if (targetReq) {
      sendNotification({
        recipientId: targetReq.requesterId,
        title: 'Vehicle Request Declined',
        body: `Your request was declined by ${user.firstName}: "${reason}".`,
        type: 'POOL_REQUEST'
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ApprovalInbox
        requests={requests}
        currentUser={user}
        onApproveRequest={handleApprove}
        onRejectRequest={handleReject}
      />
    </div>
  );
}
