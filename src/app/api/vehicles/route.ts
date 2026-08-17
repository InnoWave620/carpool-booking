import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        location: true,
      },
      orderBy: {
        registrationNumber: 'asc',
      },
    });

    return NextResponse.json(vehicles);
  } catch (error: any) {
    console.error('Error fetching vehicles from SQL Server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
