import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const requests = await prisma.poolVehicleRequest.findMany({
      include: {
        requester: true,
        vehicle: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('Error fetching pool requests from SQL Server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requesterId, vehicleId, startTime, endTime, purpose, destinationDescription } = body;

    if (!requesterId || !vehicleId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required request fields' }, { status: 400 });
    }

    // Lookup manager or fallback to default admin
    const requester = await prisma.employee.findUnique({ where: { id: requesterId } });
    const approverId = requester?.managerId || requesterId;

    const poolRequest = await prisma.poolVehicleRequest.create({
      data: {
        requesterId,
        approverId,
        vehicleId,
        startDateTime: new Date(startTime),
        endDateTime: new Date(endTime),
        purpose: purpose || 'Business operations',
        status: 'PENDING_MANAGER_APPROVAL',
      },
      include: {
        requester: true,
        vehicle: true,
      },
    });

    return NextResponse.json(poolRequest);
  } catch (error: any) {
    console.error('Error creating pool request in SQL Server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { requestId, status } = body;

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Missing requestId or status' }, { status: 400 });
    }

    const updated = await prisma.poolVehicleRequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        requester: true,
        vehicle: true,
      },
    });

    // If status is APPROVED, update vehicle to RESERVED or IN_USE
    if (status === 'APPROVED' && updated.vehicleId) {
      await prisma.vehicle.update({
        where: { id: updated.vehicleId },
        data: { status: 'RESERVED' },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating pool request in SQL Server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
