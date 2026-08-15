import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting AGL Namibia Transport Hub database seeding for MSSQL...');

  // 1. Departments
  const logOps = await prisma.department.upsert({
    where: { code: 'LOG-OPS' },
    update: {},
    create: {
      name: 'Logistics Operations',
      code: 'LOG-OPS',
    },
  });

  const custClr = await prisma.department.upsert({
    where: { code: 'CUST-CLR' },
    update: {},
    create: {
      name: 'Customs & Clearance',
      code: 'CUST-CLR',
    },
  });

  const itOps = await prisma.department.upsert({
    where: { code: 'IT-OPS' },
    update: {},
    create: {
      name: 'IT Technical Operations',
      code: 'IT-OPS',
    },
  });

  console.log('✅ Created Departments');

  // 2. Locations
  const hqLoc = await prisma.location.upsert({
    where: { code: 'HQ-WB' },
    update: {},
    create: {
      name: 'AGL Namibia HQ (Walvis Bay)',
      code: 'HQ-WB',
      address: '12 Industry Road, Walvis Bay, Namibia',
      latitude: -22.9575,
      longitude: 14.5053,
    },
  });

  const wmtLoc = await prisma.location.upsert({
    where: { code: 'WMT-PORT' },
    update: {},
    create: {
      name: 'WMT Container Terminal',
      code: 'WMT-PORT',
      address: 'Berth 10, Port of Walvis Bay, Namibia',
      latitude: -22.9461,
      longitude: 14.4982,
    },
  });

  const custLoc = await prisma.location.upsert({
    where: { code: 'CUSTOMS' },
    update: {},
    create: {
      name: 'Namibia Customs & Excise Office',
      code: 'CUSTOMS',
      address: 'Customs Bypass Road, Walvis Bay, Namibia',
      latitude: -22.9512,
      longitude: 14.5120,
    },
  });

  console.log('✅ Created Locations');

  // 3. Employees
  const adminEmp = await prisma.employee.upsert({
    where: { email: 'admin.namibia@aglgroup.com' },
    update: {},
    create: {
      email: 'admin.namibia@aglgroup.com',
      firstName: 'Senzo',
      lastName: 'Shinga',
      phone: '+264 81 123 4567',
      role: 'SUPER_ADMIN',
      departmentId: itOps.id,
      locationId: hqLoc.id,
    },
  });

  const managerEmp = await prisma.employee.upsert({
    where: { email: 'manager.logistics@aglgroup.com' },
    update: {},
    create: {
      email: 'manager.logistics@aglgroup.com',
      firstName: 'Klaus',
      lastName: 'Schneider',
      phone: '+264 81 234 5678',
      role: 'MANAGER',
      departmentId: logOps.id,
      locationId: hqLoc.id,
    },
  });

  const driverEmp = await prisma.employee.upsert({
    where: { email: 'driver.bus1@aglgroup.com' },
    update: {},
    create: {
      email: 'driver.bus1@aglgroup.com',
      firstName: 'Johannes',
      lastName: 'Nangolo',
      phone: '+264 81 456 7890',
      role: 'DRIVER',
      departmentId: logOps.id,
      locationId: hqLoc.id,
    },
  });

  console.log('✅ Created Employees');

  // 4. Vehicles
  const coasterBus = await prisma.vehicle.upsert({
    where: { registrationNumber: 'N 142-991 WB' },
    update: {},
    create: {
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
    },
  });

  const hiluxCar = await prisma.vehicle.upsert({
    where: { registrationNumber: 'N 882-102 WB' },
    update: {},
    create: {
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
    },
  });

  console.log('✅ Created Vehicles');
  console.log('🎉 AGL Namibia database seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
