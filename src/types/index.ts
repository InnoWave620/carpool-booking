export type Role = 'EMPLOYEE' | 'DRIVER' | 'MANAGER' | 'FLEET_ADMIN' | 'SUPER_ADMIN';

export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY';

export type VehicleType = 'BUS' | 'POOL_CAR' | 'VAN';

export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE' | 'DECOMMISSIONED' | 'IN_INSPECTION';

export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type BookingStatus = 
  | 'AUTO_APPROVED' 
  | 'PENDING_DRIVER_APPROVAL' 
  | 'APPROVED_BY_DRIVER' 
  | 'REJECTED_BY_DRIVER' 
  | 'CANCELLED';

export type PoolRequestStatus = 
  | 'PENDING_MANAGER_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CHECKED_OUT' 
  | 'RETURNED' 
  | 'CANCELLED';

export type InspectionType = 'PRE_TRIP' | 'POST_RETURN';

export type PassStatus = 'PASSED' | 'FLAGGED_NEEDS_SERVICE';

export interface Department {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Employee {
  id: string;
  entraId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  departmentId: string;
  locationId: string;
  managerId?: string;
  isActive: boolean;
  avatarUrl?: string;
}

export interface Driver {
  id: string;
  employeeId: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  status: DriverStatus;
  employee?: Employee;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  capacity: number;
  locationId: string;
  status: VehicleStatus;
  fuelType: string;
  mileage: number;
  imageUrl?: string;
}

export interface BusTrip {
  id: string;
  vehicleId: string;
  driverId: string;
  originLocationId: string;
  destinationLocationId: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  availableSeats: number;
  status: TripStatus;
  cutoffHours: number;
  vehicle?: Vehicle;
  driver?: Driver;
  originLocation?: Location;
  destinationLocation?: Location;
}

export interface BusBooking {
  id: string;
  busTripId: string;
  employeeId: string;
  passengerCount: number;
  status: BookingStatus;
  driverComment?: string;
  bookedAt: string;
  busTrip?: BusTrip;
  employee?: Employee;
}

export interface PoolVehicleRequest {
  id: string;
  requesterId: string;
  approverId: string;
  vehicleId?: string;
  purpose: string;
  startDateTime: string;
  endDateTime: string;
  status: PoolRequestStatus;
  rejectionReason?: string;
  createdAt: string;
  requester?: Employee;
  approver?: Employee;
  vehicle?: Vehicle;
}

export interface VehicleInspection {
  id: string;
  poolVehicleRequestId: string;
  vehicleId: string;
  inspectorId: string;
  inspectionType: InspectionType;
  odometerReading: number;
  fuelLevelPercent: number;
  cleanlinessStatus: string;
  damageNotes?: string;
  photoUrls: string[];
  passStatus: PassStatus;
  inspectedAt: string;
  vehicle?: Vehicle;
  inspector?: Employee;
}

export interface AuditEvent {
  id: string;
  performerId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  performer?: Employee;
}
