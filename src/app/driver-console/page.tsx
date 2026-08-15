'use client';

import React, { useState, useEffect } from 'react';
import { DriverConsole } from '@/components/bus/DriverConsole';
import { 
  INITIAL_BUS_TRIPS, 
  INITIAL_BUS_BOOKINGS 
} from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, BusTrip, BusBooking } from '@/types';
import { logAuditEvent } from '@/lib/audit';

export default function DriverConsolePage() {
  const [user, setUser] = useState<Employee | null>(null);
  const [trips, setTrips] = useState<BusTrip[]>(INITIAL_BUS_TRIPS);
  const [bookings, setBookings] = useState<BusBooking[]>(INITIAL_BUS_BOOKINGS);

  useEffect(() => {
    setUser(getActiveUser());
  }, []);

  if (!user) return null;

  const handleApprove = (bookingId: string, driverComment?: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'APPROVED_BY_DRIVER', driverComment } : b));
    logAuditEvent({
      performerId: user.id,
      action: 'BUS_BOOKING_APPROVED_BY_DRIVER',
      entityType: 'BusBooking',
      entityId: bookingId,
      metadata: { driverComment }
    });
  };

  const handleReject = (bookingId: string, driverComment?: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'REJECTED_BY_DRIVER', driverComment } : b));
    logAuditEvent({
      performerId: user.id,
      action: 'BUS_BOOKING_REJECTED_BY_DRIVER',
      entityType: 'BusBooking',
      entityId: bookingId,
      metadata: { driverComment }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <DriverConsole
        trips={trips}
        bookings={bookings}
        onApproveBooking={handleApprove}
        onRejectBooking={handleReject}
      />
    </div>
  );
}
