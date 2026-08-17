import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const trips = await prisma.busTrip.findMany({
      include: {
        originLocation: true,
        destinationLocation: true,
        vehicle: true,
        driver: {
          include: {
            employee: true,
          },
        },
        bookings: {
          include: {
            employee: true,
          },
        },
      },
      orderBy: {
        departureTime: 'asc',
      },
    });

    return NextResponse.json(trips);
  } catch (error: any) {
    console.error('Error fetching trips from SQL Server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { tripId, status } = body;

    if (!tripId || !status) {
      return NextResponse.json({ error: 'Missing tripId or status' }, { status: 400 });
    }

    const updatedTrip = await prisma.busTrip.update({
      where: { id: tripId },
      data: { status },
      include: {
        originLocation: true,
        destinationLocation: true,
        vehicle: true,
        driver: {
          include: {
            employee: true,
          },
        },
        bookings: {
          include: {
            employee: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTrip);
  } catch (error: any) {
    console.error('Error updating trip in SQL Server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
