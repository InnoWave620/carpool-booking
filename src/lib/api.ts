// Client API client for communicating with live SQL Server backend endpoints

export async function fetchTrips() {
  const res = await fetch('/api/trips');
  if (!res.ok) throw new Error('Failed to fetch trips');
  return res.json();
}

export async function updateTripStatus(tripId: string, status: string) {
  const res = await fetch('/api/trips', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripId, status }),
  });
  if (!res.ok) throw new Error('Failed to update trip status');
  return res.json();
}

export async function fetchBookings(employeeId?: string) {
  const url = employeeId ? `/api/bookings?employeeId=${employeeId}` : '/api/bookings';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

export async function createBooking(data: {
  busTripId: string;
  employeeId: string;
  seatNumber?: string;
  riderCategory?: string;
}) {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create booking');
  }
  return res.json();
}

export async function fetchVehicles() {
  const res = await fetch('/api/vehicles');
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}

export async function fetchPoolRequests() {
  const res = await fetch('/api/pool-requests');
  if (!res.ok) throw new Error('Failed to fetch pool requests');
  return res.json();
}

export async function createPoolRequest(data: {
  requesterId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  destinationDescription?: string;
}) {
  const res = await fetch('/api/pool-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit pool vehicle request');
  return res.json();
}

export async function updatePoolRequestStatus(requestId: string, status: string) {
  const res = await fetch('/api/pool-requests', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, status }),
  });
  if (!res.ok) throw new Error('Failed to update request status');
  return res.json();
}

export async function fetchInspections() {
  const res = await fetch('/api/inspections');
  if (!res.ok) throw new Error('Failed to fetch inspections');
  return res.json();
}

export async function createInspection(data: {
  vehicleId: string;
  inspectorId: string;
  odometerReading: number;
  fuelLevelPercent: number;
  passStatus: string;
  damageNotes?: string;
}) {
  const res = await fetch('/api/inspections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit vehicle inspection');
  return res.json();
}
