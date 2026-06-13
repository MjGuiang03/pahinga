import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Vehicle from '@/backend/models/Vehicle';
import Agency from '@/backend/models/Agency';
import { getSession } from '@/backend/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agency = await Agency.findOne({ userId: session._id });
    if (!agency) {
      return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 });
    }

    const vehicles = await Vehicle.find({ agencyId: agency._id }).lean();

    return NextResponse.json({ vehicles });
  } catch (err) {
    console.error('Fetch vehicles error:', err);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agency = await Agency.findOne({ userId: session._id });
    if (!agency) {
      return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 });
    }

    const { plateNumber, type, capacity } = await request.json();

    if (!plateNumber || !type || !capacity) {
      return NextResponse.json({ error: 'Plate number, vehicle type, and capacity are required.' }, { status: 400 });
    }

    const vehicle = await Vehicle.create({
      agencyId: agency._id,
      plateNumber,
      type,
      capacity: Number(capacity),
      status: 'available',
    });

    return NextResponse.json({ message: 'Vehicle added successfully.', vehicle }, { status: 201 });
  } catch (err) {
    console.error('Create vehicle error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
