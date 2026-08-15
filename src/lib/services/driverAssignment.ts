import { INITIAL_DRIVERS, INITIAL_VEHICLES, INITIAL_BUS_TRIPS, INITIAL_EMPLOYEES } from '@/lib/store';

export interface AssignmentAttempt {
  id: string;
  tripId: string;
  driverId: string;
  vehicleId: string;
  attemptNumber: number;
  status: 'OFFERED' | 'ACCEPTED' | 'REJECTED';
  rejectionReason?: string;
  timestamp: string;
}

// In-memory assignment attempts log for client/demo state
let assignmentAttempts: AssignmentAttempt[] = [];

export function autoFindAvailableBusAndDriver(departureTime: string, arrivalTime: string) {
  // 1. Find buses available
  const availableBuses = INITIAL_VEHICLES.filter(
    (v) => v.type === 'BUS' && v.status === 'AVAILABLE'
  );

  if (availableBuses.length === 0) {
    return { success: false, reason: 'No available buses in fleet' };
  }

  // 2. Find drivers available
  const availableDrivers = INITIAL_DRIVERS.filter((d) => d.status === 'AVAILABLE');
  if (availableDrivers.length === 0) {
    return { success: false, reason: 'No available drivers on duty' };
  }

  const selectedBus = availableBuses[0];
  const selectedDriver = availableDrivers[0];
  const driverEmployee = INITIAL_EMPLOYEES.find((e) => e.id === selectedDriver.employeeId);

  return {
    success: true,
    bus: selectedBus,
    driver: selectedDriver,
    driverName: driverEmployee ? `${driverEmployee.firstName} ${driverEmployee.lastName}` : 'Driver',
  };
}

export function recordAssignmentAttempt(
  tripId: string,
  driverId: string,
  vehicleId: string,
  status: 'OFFERED' | 'ACCEPTED' | 'REJECTED',
  rejectionReason?: string
): AssignmentAttempt {
  const attempt: AssignmentAttempt = {
    id: `assign-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tripId,
    driverId,
    vehicleId,
    attemptNumber: assignmentAttempts.filter((a) => a.tripId === tripId).length + 1,
    status,
    rejectionReason,
    timestamp: new Date().toISOString(),
  };

  assignmentAttempts.unshift(attempt);
  return attempt;
}

export function getAssignmentAttemptsForTrip(tripId: string): AssignmentAttempt[] {
  return assignmentAttempts.filter((a) => a.tripId === tripId);
}
