import { BusBooking, BusTrip } from '@/types';
import { INITIAL_BUS_BOOKINGS, INITIAL_BUS_TRIPS } from '@/lib/store';

// Helper for seat Map layout generator (22-seat Executive Bus: 2+2 layout)
export interface SeatLayoutInfo {
  seatNumber: string;
  row: number;
  col: number; // 1: Window Left, 2: Aisle Left, 3: Aisle Right, 4: Window Right
  isOccupied: boolean;
  bookedByEmployeeId?: string;
}

export function generateBusSeatLayout(trip: BusTrip, existingBookings: BusBooking[]): SeatLayoutInfo[] {
  const totalSeats = trip.totalSeats || 22;
  const layout: SeatLayoutInfo[] = [];

  // Generate 22 seats in 5 rows + rear 2 seats
  for (let i = 1; i <= totalSeats; i++) {
    const seatNum = i < 10 ? `0${i}` : `${i}`;
    const row = Math.ceil(i / 4);
    const col = ((i - 1) % 4) + 1;

    const existingBooking = existingBookings.find(
      (b) => b.busTripId === trip.id && (b.seatNumber === seatNum || b.seatNumber === `${i}`)
    );

    layout.push({
      seatNumber: seatNum,
      row,
      col,
      isOccupied: !!existingBooking,
      bookedByEmployeeId: existingBooking?.employeeId,
    });
  }

  return layout;
}

export function validateAndBookSeat(
  tripId: string,
  employeeId: string,
  seatNumber: string,
  currentBookings: BusBooking[],
  currentTrips: BusTrip[]
): { success: boolean; message: string; updatedBookings?: BusBooking[]; updatedTrip?: BusTrip } {
  const trip = currentTrips.find((t) => t.id === tripId);
  if (!trip) {
    return { success: false, message: 'Trip not found.' };
  }

  if (trip.status === 'CANCELLED' || trip.status === 'COMPLETED') {
    return { success: false, message: `Trip is ${trip.status.toLowerCase()} and unavailable for booking.` };
  }

  if (trip.availableSeats <= 0) {
    return { success: false, message: 'Trip is FULL. No available seats remaining.' };
  }

  // Double-booking concurrency check: Ensure seat is not already taken
  const seatAlreadyTaken = currentBookings.some(
    (b) => b.busTripId === tripId && b.seatNumber === seatNumber && b.status !== 'CANCELLED'
  );

  if (seatAlreadyTaken) {
    return {
      success: false,
      message: `CONCURRENCY CONFLICT: Seat ${seatNumber} was just booked by another passenger. Please select another seat.`,
    };
  }

  // Double-booking per employee check: Ensure user hasn't already booked this trip
  const userAlreadyBooked = currentBookings.some(
    (b) => b.busTripId === tripId && b.employeeId === employeeId && b.status !== 'CANCELLED'
  );

  if (userAlreadyBooked) {
    return { success: false, message: 'You have already booked a seat on this shuttle trip.' };
  }

  const newBooking: BusBooking = {
    id: `book-${Date.now()}`,
    busTripId: tripId,
    employeeId,
    seatNumber,
    passengerCount: 1,
    status: 'AUTO_APPROVED',
    bookedAt: new Date().toISOString(),
  };

  const updatedTrip: BusTrip = {
    ...trip,
    availableSeats: Math.max(0, trip.availableSeats - 1),
  };

  return {
    success: true,
    message: `Seat ${seatNumber} reserved successfully! Status: AUTO_APPROVED.`,
    updatedBookings: [newBooking, ...currentBookings],
    updatedTrip,
  };
}
