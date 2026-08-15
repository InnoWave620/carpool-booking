'use client';

import React, { useState, useEffect } from 'react';
import { FleetAdminPanel } from '@/components/admin/FleetAdminPanel';
import { 
  INITIAL_VEHICLES, 
  INITIAL_BUS_TRIPS 
} from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, Vehicle, BusTrip } from '@/types';
import { logAuditEvent } from '@/lib/audit';

export default function AdminPage() {
  const [user, setUser] = useState<Employee | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [trips, setTrips] = useState<BusTrip[]>(INITIAL_BUS_TRIPS);

  useEffect(() => {
    setUser(getActiveUser());
  }, []);

  if (!user) return null;

  const handleUpdateCutoff = (tripId: string, cutoffHours: number) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, cutoffHours } : t));
    logAuditEvent({
      performerId: user.id,
      action: 'SHUTTLE_CUTOFF_UPDATED',
      entityType: 'BusTrip',
      entityId: tripId,
      metadata: { cutoffHours }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <FleetAdminPanel
        vehicles={vehicles}
        trips={trips}
        user={user}
        onUpdateCutoff={handleUpdateCutoff}
      />
    </div>
  );
}
