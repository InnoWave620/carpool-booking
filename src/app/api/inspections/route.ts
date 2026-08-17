import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const inspections = await prisma.vehicleInspection.findMany({
      include: {
        vehicle: true,
        inspector: true,
      },
      orderBy: {
        inspectedAt: 'desc',
      },
    });

    return NextResponse.json(inspections);
  } catch (error: any) {
    console.error('Error fetching inspections from SQL Server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleId, inspectorId, odometerReading, fuelLevelPercent, passStatus, damageNotes } = body;

    if (!vehicleId || !inspectorId) {
      return NextResponse.json({ error: 'Missing vehicleId or inspectorId' }, { status: 400 });
    }

    // Find latest pool vehicle request for this vehicle or create a placeholder
    let poolReq = await prisma.poolVehicleRequest.findFirst({
      where: { vehicleId },
      orderBy: { createdAt: 'desc' },
    });

    if (!poolReq) {
      poolReq = await prisma.poolVehicleRequest.create({
        data: {
          requesterId: inspectorId,
          approverId: inspectorId,
          vehicleId,
          startDateTime: new Date(),
          endDateTime: new Date(),
          purpose: 'Vehicle Return Clearance Inspection',
          status: 'RETURNED',
        },
      });
    }

    const nextVehicleStatus = passStatus === 'PASSED' ? 'AVAILABLE' : 'UNDER_MAINTENANCE';

    const [inspection] = await prisma.$transaction([
      prisma.vehicleInspection.upsert({
        where: { poolVehicleRequestId: poolReq.id },
        create: {
          poolVehicleRequestId: poolReq.id,
          vehicleId,
          inspectorId,
          inspectionType: 'POST_RETURN',
          odometerReading: Number(odometerReading) || 0,
          fuelLevelPercent: Number(fuelLevelPercent) || 100,
          passStatus: passStatus || 'PASSED',
          damageNotes: damageNotes || '',
          cleanlinessStatus: 'Clean & Sanitized',
        },
        update: {
          odometerReading: Number(odometerReading) || 0,
          fuelLevelPercent: Number(fuelLevelPercent) || 100,
          passStatus: passStatus || 'PASSED',
          damageNotes: damageNotes || '',
        },
        include: {
          vehicle: true,
          inspector: true,
        },
      }),
      prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          status: nextVehicleStatus,
          mileage: Number(odometerReading) || undefined,
        },
      }),
    ]);

    return NextResponse.json(inspection);
  } catch (error: any) {
    console.error('Error creating inspection in SQL Server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
