'use client';

import React, { useState, useEffect } from 'react';
import { PoolCalendar } from '@/components/pool/PoolCalendar';
import { 
  INITIAL_VEHICLES, 
  INITIAL_POOL_REQUESTS 
} from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, Vehicle, PoolVehicleRequest } from '@/types';
import { logAuditEvent } from '@/lib/audit';
import { sendNotification } from '@/lib/notifications';

export default function PoolVehiclesPage() {
  const [user, setUser] = useState<Employee | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [requests, setRequests] = useState<PoolVehicleRequest[]>(INITIAL_POOL_REQUESTS);

  useEffect(() => {
    setUser(getActiveUser());
  }, []);

  if (!user) return null;

  const handleRequestVehicle = (params: {
    vehicleId: string;
    purpose: string;
    startDateTime: string;
    endDateTime: string;
  }) => {
    const newRequest: PoolVehicleRequest = {
      id: `pool-req-${Date.now()}`,
      requesterId: user.id,
      approverId: user.managerId || 'emp-manager',
      vehicleId: params.vehicleId,
      purpose: params.purpose,
      startDateTime: params.startDateTime,
      endDateTime: params.endDateTime,
      status: 'PENDING_MANAGER_APPROVAL',
      createdAt: new Date().toISOString(),
    };

    setRequests(prev => [newRequest, ...prev]);

    logAuditEvent({
      performerId: user.id,
      action: 'POOL_VEHICLE_REQUESTED',
      entityType: 'PoolVehicleRequest',
      entityId: newRequest.id,
      metadata: params
    });

    sendNotification({
      recipientId: newRequest.approverId,
      title: 'Pool Vehicle Approval Requested',
      body: `${user.firstName} ${user.lastName} requested a vehicle for business trip: "${params.purpose}".`,
      type: 'POOL_REQUEST'
    });
  };

  const handleDeclareReturn = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'RETURNED' } : r));
    
    // Update vehicle status to IN_INSPECTION
    const targetReq = requests.find(r => r.id === requestId);
    if (targetReq?.vehicleId) {
      setVehicles(prev => prev.map(v => v.id === targetReq.vehicleId ? { ...v, status: 'IN_INSPECTION' } : v));
    }

    logAuditEvent({
      performerId: user.id,
      action: 'POOL_VEHICLE_RETURN_DECLARED',
      entityType: 'PoolVehicleRequest',
      entityId: requestId
    });

    sendNotification({
      recipientId: 'emp-fleet',
      title: 'Vehicle Returned - Inspection Required',
      body: `Vehicle return declared by ${user.firstName}. Ready for Fleet Admin inspection.`,
      type: 'INSPECTION'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PoolCalendar
        vehicles={vehicles}
        requests={requests}
        user={user}
        onRequestVehicle={handleRequestVehicle}
        onDeclareReturn={handleDeclareReturn}
      />
    </div>
  );
}
