import { 
  Department, 
  Location, 
  Employee, 
  Driver, 
  Vehicle, 
  BusTrip, 
  BusBooking, 
  PoolVehicleRequest, 
  VehicleInspection, 
  AuditEvent 
} from '@/types';

// Mock seed datasets for AGL Namibia
export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Logistics Operations', code: 'LOG-OPS', createdAt: new Date().toISOString() },
  { id: 'dept-2', name: 'Customs & Clearance', code: 'CUST-CLR', createdAt: new Date().toISOString() },
  { id: 'dept-3', name: 'IT Technical Operations', code: 'IT-OPS', createdAt: new Date().toISOString() },
  { id: 'dept-4', name: 'Executive & Admin', code: 'EXEC-ADM', createdAt: new Date().toISOString() },
];

export const INITIAL_LOCATIONS: Location[] = [
  { id: 'loc-1', name: 'AGL Namibia HQ (Walvis Bay)', code: 'HQ-WB', address: '12 Industry Road, Walvis Bay, Namibia', latitude: -22.9575, longitude: 14.5053 },
  { id: 'loc-2', name: 'WMT Container Terminal', code: 'WMT-PORT', address: 'Berth 10, Port of Walvis Bay, Namibia', latitude: -22.9461, longitude: 14.4982 },
  { id: 'loc-3', name: 'Namibia Customs & Excise Office', code: 'CUSTOMS', address: 'Customs Bypass Road, Walvis Bay, Namibia', latitude: -22.9512, longitude: 14.5120 },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-admin',
    email: 'admin.namibia@aglgroup.com',
    firstName: 'Senzo',
    lastName: 'Shinga',
    phone: '+264 81 123 4567',
    role: 'SUPER_ADMIN',
    departmentId: 'dept-3',
    locationId: 'loc-1',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'emp-manager',
    email: 'manager.logistics@aglgroup.com',
    firstName: 'Klaus',
    lastName: 'Schneider',
    phone: '+264 81 234 5678',
    role: 'MANAGER',
    departmentId: 'dept-1',
    locationId: 'loc-1',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'emp-fleet',
    email: 'fleet.admin@aglgroup.com',
    firstName: 'Maria',
    lastName: 'Amadhila',
    phone: '+264 81 345 6789',
    role: 'FLEET_ADMIN',
    departmentId: 'dept-1',
    locationId: 'loc-1',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'emp-driver-1',
    email: 'driver.bus1@aglgroup.com',
    firstName: 'Johannes',
    lastName: 'Nangolo',
    phone: '+264 81 456 7890',
    role: 'DRIVER',
    departmentId: 'dept-1',
    locationId: 'loc-1',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'emp-staff-1',
    email: 'petrus.haimbodi@aglgroup.com',
    firstName: 'Petrus',
    lastName: 'Haimbodi',
    phone: '+264 81 567 8901',
    role: 'EMPLOYEE',
    departmentId: 'dept-2',
    locationId: 'loc-1',
    managerId: 'emp-manager',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'emp-staff-2',
    email: 'selma.shikongo@aglgroup.com',
    firstName: 'Selma',
    lastName: 'Shikongo',
    phone: '+264 81 678 9012',
    role: 'EMPLOYEE',
    departmentId: 'dept-1',
    locationId: 'loc-1',
    managerId: 'emp-manager',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    employeeId: 'emp-driver-1',
    licenseNumber: 'NAM-DL-98231',
    licenseCategory: 'Code C1 / Heavy Passenger',
    licenseExpiry: '2028-12-31',
    status: 'AVAILABLE',
  },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-bus-1',
    registrationNumber: 'N 142-991 WB',
    make: 'Toyota',
    model: 'Coaster Executive Bus',
    year: 2024,
    type: 'BUS',
    capacity: 22,
    locationId: 'loc-1',
    status: 'AVAILABLE',
    fuelType: 'Diesel',
    mileage: 34200,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'veh-pool-1',
    registrationNumber: 'N 882-102 WB',
    make: 'Toyota',
    model: 'Hilux Double Cab 4x4',
    year: 2023,
    type: 'POOL_CAR',
    capacity: 5,
    locationId: 'loc-1',
    status: 'AVAILABLE',
    fuelType: 'Diesel',
    mileage: 48900,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'veh-pool-2',
    registrationNumber: 'N 554-331 WB',
    make: 'Volkswagen',
    model: 'Polo Vivo Sedan',
    year: 2024,
    type: 'POOL_CAR',
    capacity: 5,
    locationId: 'loc-1',
    status: 'AVAILABLE',
    fuelType: 'Petrol',
    mileage: 18400,
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600',
  },
];

// Helper to get today/tomorrow dates ISO format
const todayStr = (hours: number, mins: number = 0) => {
  const d = new Date();
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
};

const tomorrowStr = (hours: number, mins: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
};

export const INITIAL_BUS_TRIPS: BusTrip[] = [
  {
    id: 'trip-1',
    vehicleId: 'veh-bus-1',
    driverId: 'drv-1',
    originLocationId: 'loc-1',
    destinationLocationId: 'loc-2',
    departureTime: todayStr(8, 0),
    arrivalTime: todayStr(8, 30),
    totalSeats: 22,
    availableSeats: 16,
    status: 'SCHEDULED',
    cutoffHours: 12,
  },
  {
    id: 'trip-2',
    vehicleId: 'veh-bus-1',
    driverId: 'drv-1',
    originLocationId: 'loc-2',
    destinationLocationId: 'loc-1',
    departureTime: todayStr(9, 0),
    arrivalTime: todayStr(9, 30),
    totalSeats: 22,
    availableSeats: 20,
    status: 'SCHEDULED',
    cutoffHours: 12,
  },
  {
    id: 'trip-3',
    vehicleId: 'veh-bus-1',
    driverId: 'drv-1',
    originLocationId: 'loc-1',
    destinationLocationId: 'loc-3',
    departureTime: todayStr(10, 0),
    arrivalTime: todayStr(10, 30),
    totalSeats: 22,
    availableSeats: 18,
    status: 'SCHEDULED',
    cutoffHours: 12,
  },
  {
    id: 'trip-4',
    vehicleId: 'veh-bus-1',
    driverId: 'drv-1',
    originLocationId: 'loc-3',
    destinationLocationId: 'loc-1',
    departureTime: todayStr(11, 0),
    arrivalTime: todayStr(11, 30),
    totalSeats: 22,
    availableSeats: 22,
    status: 'SCHEDULED',
    cutoffHours: 12,
  },
  {
    id: 'trip-5',
    vehicleId: 'veh-bus-1',
    driverId: 'drv-1',
    originLocationId: 'loc-1',
    destinationLocationId: 'loc-2',
    departureTime: tomorrowStr(8, 0),
    arrivalTime: tomorrowStr(8, 30),
    totalSeats: 22,
    availableSeats: 14,
    status: 'SCHEDULED',
    cutoffHours: 12,
  },
];

export const INITIAL_BUS_BOOKINGS: BusBooking[] = [
  {
    id: 'book-1',
    busTripId: 'trip-1',
    employeeId: 'emp-staff-1',
    passengerCount: 2,
    status: 'AUTO_APPROVED',
    bookedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'book-2',
    busTripId: 'trip-1',
    employeeId: 'emp-staff-2',
    passengerCount: 4,
    status: 'PENDING_DRIVER_APPROVAL',
    bookedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // booked 2 hours ago (within 12h window)
  },
];

export const INITIAL_POOL_REQUESTS: PoolVehicleRequest[] = [
  {
    id: 'pool-req-1',
    requesterId: 'emp-staff-1',
    approverId: 'emp-manager',
    vehicleId: 'veh-pool-1',
    purpose: 'On-site audit and cargo inspection at Customs Depot',
    startDateTime: tomorrowStr(9, 0),
    endDateTime: tomorrowStr(17, 0),
    status: 'PENDING_MANAGER_APPROVAL',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_INSPECTIONS: VehicleInspection[] = [];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'audit-1',
    performerId: 'emp-staff-1',
    action: 'BUS_BOOKING_CREATED',
    entityType: 'BusBooking',
    entityId: 'book-1',
    metadata: JSON.stringify({ tripId: 'trip-1', seats: 2, status: 'AUTO_APPROVED' }),
    ipAddress: '197.243.12.44',
    userAgent: 'AGL-MobileApp/1.0 (Android)',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];
