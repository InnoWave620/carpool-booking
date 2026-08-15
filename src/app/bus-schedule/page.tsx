'use client';

import React, { useState, useEffect } from 'react';
import { BusScheduleGrid } from '@/components/bus/BusScheduleGrid';
import { 
  INITIAL_BUS_TRIPS, 
  INITIAL_BUS_BOOKINGS, 
  INITIAL_VEHICLES 
} from '@/lib/store';
import { getActiveUser } from '@/lib/auth';
import { Employee, BusTrip, BusBooking } from '@/types';
import { logAuditEvent } from '@/lib/audit';
import { sendNotification } from '@/lib/notifications';

export default function BusSchedulePage() {
  const [user, setUser] = useState<Employee | null>(null);
  const [trips, setTrips] = useState<BusTrip[]>(INITIAL_BUS_TRIPS);
  const [bookings, setBookings] = useState<BusBooking[]>(INITIAL_BUS_BOOKINGS);

  useEffect(() => {
    setUser(getActiveUser());
  }, []);

  if (!user) return null;

  const handleBookSeat = (tripId: string, passengerCount: number) => {
    const targetTrip = trips.find(t => t.id === tripId);
    if (!targetTrip || targetTrip.availableSeats < passengerCount) return;

    // Calculate cutoff hours logic (12h or 24h)
    const departureDate = new Date(targetTrip.departureTime);
    const now = new Date();
    const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isAutoApproved = hoursUntilDeparture >= targetTrip.cutoffHours;

    const newBookingStatus = isAutoApproved ? 'AUTO_APPROVED' : 'PENDING_DRIVER_APPROVAL';

    const newBooking: BusBooking = {
      id: `book-${Date.now()}`,
      busTripId: tripId,
      employeeId: user.id,
      passengerCount,
      status: newBookingStatus,
      bookedAt: new Date().toISOString(),
      busTrip: targetTrip,
      employee: user,
    };

    setBookings(prev => [newBooking, ...prev]);

    // Update available seats on trip
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          availableSeats: Math.max(0, t.availableSeats - passengerCount)
        };
      }
      return t;
    }));

    // Log Audit Event
    logAuditEvent({
      performerId: user.id,
      action: 'BUS_BOOKING_CREATED',
      entityType: 'BusBooking',
      entityId: newBooking.id,
      metadata: { tripId, passengerCount, status: newBookingStatus, hoursUntilDeparture }
    });

    // Notify Driver if late booking
    if (!isAutoApproved) {
      sendNotification({
        recipientId: targetTrip.driverId || 'emp-driver-1',
        title: 'Pending Late Shuttle Booking',
        body: `${user.firstName} ${user.lastName} requested ${passengerCount} seat(s) on ${targetTrip.originLocation?.code} → ${targetTrip.destinationLocation?.code} shuttle. Requires approval.`,
        type: 'DRIVER_APPROVAL'
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <BusScheduleGrid
        trips={trips}
        bookings={bookings}
        user={user}
        onBookSeat={handleBookSeat}
      />
    </div>
  );
}
