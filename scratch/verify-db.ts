import { prisma } from '../src/lib/prisma';

async function main() {
  const employees = await prisma.employee.findMany();
  const vehicles = await prisma.vehicle.findMany();
  const trips = await prisma.busTrip.findMany({ 
    include: { originLocation: true, destinationLocation: true, vehicle: true } 
  });
  const bookings = await prisma.busBooking.findMany({
    include: { employee: true }
  });
  const poolRequests = await prisma.poolVehicleRequest.findMany({
    include: { requester: true, vehicle: true }
  });
  const inspections = await prisma.vehicleInspection.findMany({
    include: { vehicle: true, inspector: true }
  });

  console.log('=====================================================');
  console.log('🎉 LIVE MSSQL CARPOOL DATABASE REPORT:');
  console.log(`• Employees in Database: ${employees.length}`);
  employees.forEach(e => console.log(`   - ${e.firstName} ${e.lastName} (${e.role})`));
  console.log(`• Fleet Vehicles in Database: ${vehicles.length}`);
  vehicles.forEach(v => console.log(`   - ${v.make} ${v.model} [${v.registrationNumber}] (${v.status})`));
  console.log(`• Bus Trips in Database: ${trips.length}`);
  trips.forEach(t => console.log(`   - ${t.originLocation.name} ➔ ${t.destinationLocation.name} (${t.availableSeats} seats left)`));
  console.log(`• Shuttle Bookings in Database: ${bookings.length}`);
  bookings.forEach(b => console.log(`   - Seat #${b.seatNumber} booked by ${b.employee.firstName} ${b.employee.lastName} [${b.status}]`));
  console.log(`• Pool Vehicle Requests in Database: ${poolRequests.length}`);
  poolRequests.forEach(p => console.log(`   - ${p.requester.firstName} ${p.requester.lastName} requested ${p.vehicle?.model} [${p.status}]`));
  console.log(`• Vehicle Inspections in Database: ${inspections.length}`);
  inspections.forEach(i => console.log(`   - Inspection for ${i.vehicle?.model} by ${i.inspector?.firstName} ${i.inspector?.lastName} [${i.passStatus}]`));
  console.log('=====================================================');

  await prisma.$disconnect();
}

main().catch(console.error);
