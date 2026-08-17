import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const bookings = await prisma.busBooking.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: {
        busTrip: {
          include: {
            originLocation: true,
            destinationLocation: true,
            vehicle: true,
          },
        },
        employee: true,
      },
      orderBy: {
        bookedAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Error fetching bookings from SQL Server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { busTripId, employeeId, seatNumber, riderCategory } = body;

    if (!busTripId || !employeeId) {
      return NextResponse.json({ error: 'Missing busTripId or employeeId' }, { status: 400 });
    }

    // Check available seats on trip
    const trip = await prisma.busTrip.findUnique({
      where: { id: busTripId },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Bus trip not found' }, { status: 404 });
    }

    if (trip.availableSeats < 1) {
      return NextResponse.json({ error: 'No seats available on this trip' }, { status: 400 });
    }

    // Create booking and decrement seats in a transaction
    const [booking] = await prisma.$transaction([
      prisma.busBooking.create({
        data: {
          busTripId,
          employeeId,
          seatNumber: seatNumber || '01',
          status: 'AUTO_APPROVED',
        },
        include: {
          busTrip: {
            include: {
              originLocation: true,
              destinationLocation: true,
              vehicle: true,
            },
          },
          employee: true,
        },
      }),
      prisma.busTrip.update({
        where: { id: busTripId },
        data: {
          availableSeats: { decrement: 1 },
        },
      }),
    ]);

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Error creating booking in SQL Server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
