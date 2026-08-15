import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const todayStr = (hours: number, mins: number = 0) => {
  const d = new Date();
  d.setHours(hours, mins, 0, 0);
  return d;
};

const tomorrowStr = (hours: number, mins: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hours, mins, 0, 0);
  return d;
};

async function seed() {
  console.log('🌱 Starting comprehensive AGL Namibia Transport Hub database seeding for MSSQL...');

  // Clean up dependent tables in correct foreign key order
  await prisma.auditEvent.deleteMany();
  await prisma.approvalTask.deleteMany();
  await prisma.vehicleInspection.deleteMany();
  await prisma.poolVehicleRequest.deleteMany();
  await prisma.busBooking.deleteMany();
  await prisma.busTrip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.location.deleteMany();
  await prisma.department.deleteMany();

  // 1. Departments
  const logOps = await prisma.department.create({
    data: { name: 'Logistics Operations', code: 'LOG-OPS' }
  });

  const custClr = await prisma.department.create({
    data: { name: 'Customs & Clearance', code: 'CUST-CLR' }
  });

  const itOps = await prisma.department.create({
    data: { name: 'IT Technical Operations', code: 'IT-OPS' }
  });

  const execAdm = await prisma.department.create({
    data: { name: 'Executive & Admin', code: 'EXEC-ADM' }
  });

  console.log('✅ Created 4 Departments');

  // 2. Locations
  const hqLoc = await prisma.location.create({
    data: {
      name: 'AGL Namibia HQ (Walvis Bay)',
      code: 'HQ-WB',
      address: '12 Industry Road, Walvis Bay, Namibia',
      latitude: -22.9575,
      longitude: 14.5053,
    }
  });

  const wmtLoc = await prisma.location.create({
    data: {
      name: 'WMT Container Terminal',
      code: 'WMT-PORT',
      address: 'Berth 10, Port of Walvis Bay, Namibia',
      latitude: -22.9461,
      longitude: 14.4982,
    }
  });

  const custLoc = await prisma.location.create({
    data: {
      name: 'Namibia Customs & Excise Office',
      code: 'CUSTOMS',
      address: 'Customs Bypass Road, Walvis Bay, Namibia',
      latitude: -22.9512,
      longitude: 14.5120,
    }
  });

  console.log('✅ Created 3 Locations');

  // 3. Employees
  const adminEmp = await prisma.employee.create({
    data: {
      email: 'admin.namibia@aglgroup.com',
      firstName: 'Senzo',
      lastName: 'Shinga',
      phone: '+264 81 123 4567',
      role: 'SUPER_ADMIN',
      departmentId: itOps.id,
      locationId: hqLoc.id,
    }
  });

  const managerEmp = await prisma.employee.create({
    data: {
      email: 'manager.logistics@aglgroup.com',
      firstName: 'Klaus',
      lastName: 'Schneider',
      phone: '+264 81 234 5678',
      role: 'MANAGER',
      departmentId: logOps.id,
      locationId: hqLoc.id,
    }
  });

  const fleetEmp = await prisma.employee.create({
    data: {
      email: 'fleet.admin@aglgroup.com',
      firstName: 'Maria',
      lastName: 'Amadhila',
      phone: '+264 81 345 6789',
      role: 'FLEET_ADMIN',
      departmentId: logOps.id,
      locationId: hqLoc.id,
    }
  });

  const driverEmp = await prisma.employee.create({
    data: {
      email: 'driver.bus1@aglgroup.com',
      firstName: 'Johannes',
      lastName: 'Nangolo',
      phone: '+264 81 456 7890',
      role: 'DRIVER',
      departmentId: logOps.id,
      locationId: hqLoc.id,
    }
  });

  const staff1 = await prisma.employee.create({
    data: {
      email: 'petrus.haimbodi@aglgroup.com',
      firstName: 'Petrus',
      lastName: 'Haimbodi',
      phone: '+264 81 567 8901',
      role: 'EMPLOYEE',
      departmentId: custClr.id,
      locationId: hqLoc.id,
      managerId: managerEmp.id,
    }
  });

  const staff2 = await prisma.employee.create({
    data: {
      email: 'selma.shikongo@aglgroup.com',
      firstName: 'Selma',
      lastName: 'Shikongo',
      phone: '+264 81 678 9012',
      role: 'EMPLOYEE',
      riderCategory: 'AGL_WORKER',
      departmentId: logOps.id,
      locationId: hqLoc.id,
      managerId: managerEmp.id,
    }
  });

  const externalRider = await prisma.employee.create({
    data: {
      email: 'david.wilson@partner-logistics.com',
      firstName: 'David (External)',
      lastName: 'Wilson',
      phone: '+264 81 999 0011',
      role: 'EMPLOYEE',
      riderCategory: 'EXTERNAL_RIDER',
      departmentId: logOps.id,
      locationId: wmtLoc.id,
    }
  });

  console.log('✅ Created 7 Employees (AGL Workers & External Riders)');

  // 4. Driver Profile
  const driverProfile = await prisma.driver.create({
    data: {
      employeeId: driverEmp.id,
      licenseNumber: 'NAM-DL-98231',
      licenseCategory: 'Code C1 / Heavy Passenger',
      licenseExpiry: new Date('2028-12-31'),
      status: 'AVAILABLE',
    }
  });

  console.log('✅ Created Driver Profile');

  // 5. Vehicles
  const coasterBus = await prisma.vehicle.create({
    data: {
      registrationNumber: 'N 142-991 WB',
      make: 'Toyota',
      model: 'Coaster Executive Bus',
      year: 2024,
      type: 'BUS',
      capacity: 22,
      locationId: hqLoc.id,
      status: 'AVAILABLE',
      fuelType: 'Diesel',
      mileage: 34200,
    }
  });

  const hiluxCar = await prisma.vehicle.create({
    data: {
      registrationNumber: 'N 882-102 WB',
      make: 'Toyota',
      model: 'Hilux Double Cab 4x4',
      year: 2023,
      type: 'POOL_CAR',
      capacity: 5,
      locationId: hqLoc.id,
      status: 'AVAILABLE',
      fuelType: 'Diesel',
      mileage: 48900,
    }
  });

  const poloCar = await prisma.vehicle.create({
    data: {
      registrationNumber: 'N 554-331 WB',
      make: 'Volkswagen',
      model: 'Polo Vivo Sedan',
      year: 2024,
      type: 'POOL_CAR',
      capacity: 5,
      locationId: hqLoc.id,
      status: 'AVAILABLE',
      fuelType: 'Petrol',
      mileage: 18400,
    }
  });

  console.log('✅ Created 3 Vehicles');

  // 6. Bus Trips
  const trip1 = await prisma.busTrip.create({
    data: {
      vehicleId: coasterBus.id,
      driverId: driverProfile.id,
      originLocationId: hqLoc.id,
      destinationLocationId: wmtLoc.id,
      departureTime: todayStr(8, 0),
      arrivalTime: todayStr(8, 30),
      totalSeats: 22,
      availableSeats: 16,
      status: 'SCHEDULED',
      cutoffHours: 12,
    }
  });

  const trip2 = await prisma.busTrip.create({
    data: {
      vehicleId: coasterBus.id,
      driverId: driverProfile.id,
      originLocationId: wmtLoc.id,
      destinationLocationId: hqLoc.id,
      departureTime: todayStr(9, 0),
      arrivalTime: todayStr(9, 30),
      totalSeats: 22,
      availableSeats: 20,
      status: 'SCHEDULED',
      cutoffHours: 12,
    }
  });

  const trip3 = await prisma.busTrip.create({
    data: {
      vehicleId: coasterBus.id,
      driverId: driverProfile.id,
      originLocationId: hqLoc.id,
      destinationLocationId: custLoc.id,
      departureTime: todayStr(10, 0),
      arrivalTime: todayStr(10, 30),
      totalSeats: 22,
      availableSeats: 18,
      status: 'SCHEDULED',
      cutoffHours: 12,
    }
  });

  console.log('✅ Created 3 Bus Trips');

  // 7. Bus Bookings
  const booking1 = await prisma.busBooking.create({
    data: {
      busTripId: trip1.id,
      employeeId: staff1.id,
      seatNumber: '01',
      passengerCount: 2,
      status: 'AUTO_APPROVED',
      bookedAt: new Date(Date.now() - 3600000 * 18),
    }
  });

  const booking2 = await prisma.busBooking.create({
    data: {
      busTripId: trip1.id,
      employeeId: staff2.id,
      seatNumber: '03',
      passengerCount: 4,
      status: 'PENDING_DRIVER_APPROVAL',
      bookedAt: new Date(Date.now() - 3600000 * 2),
    }
  });

  console.log('✅ Created 2 Bus Bookings');

  // 8. Pool Vehicle Request
  const poolReq = await prisma.poolVehicleRequest.create({
    data: {
      requesterId: staff1.id,
      approverId: managerEmp.id,
      vehicleId: hiluxCar.id,
      purpose: 'On-site audit and cargo inspection at Customs Depot',
      startDateTime: tomorrowStr(9, 0),
      endDateTime: tomorrowStr(17, 0),
      status: 'PENDING_MANAGER_APPROVAL',
      createdAt: new Date(),
    }
  });

  console.log('✅ Created Pool Vehicle Request');

  // 9. Vehicle Inspection
  await prisma.vehicleInspection.create({
    data: {
      poolVehicleRequestId: poolReq.id,
      vehicleId: hiluxCar.id,
      inspectorId: staff1.id,
      odometerReading: 48900,
      fuelLevelPercent: 90,
      cleanlinessStatus: 'CLEAN',
      damageNotes: 'None',
      inspectionType: 'PRE_TRIP',
      passStatus: 'PASSED',
      inspectedAt: new Date(),
    }
  });

  console.log('✅ Created Vehicle Inspection');

  // 10. Audit Event
  await prisma.auditEvent.create({
    data: {
      performerId: staff1.id,
      action: 'BUS_BOOKING_CREATED',
      entityType: 'BusBooking',
      entityId: booking1.id,
      metadata: JSON.stringify({ tripId: trip1.id, seats: 2, status: 'AUTO_APPROVED' }),
      ipAddress: '197.243.12.44',
      userAgent: 'AGL-MobileApp/1.0 (Android)',
      timestamp: new Date(Date.now() - 3600000 * 18),
    }
  });

  console.log('✅ Created Audit Log Event');
  console.log('🎉 Comprehensive AGL Namibia database seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
