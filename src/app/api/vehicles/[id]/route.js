import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Vehicle from '@/backend/models/Vehicle';
import Agency from '@/backend/models/Agency';
import { getSession } from '@/backend/lib/auth';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agency = await Agency.findOne({ userId: session._id });
    if (!agency) {
      return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle || vehicle.agencyId.toString() !== agency._id.toString()) {
      return NextResponse.json({ error: 'Vehicle not found or access denied.' }, { status: 404 });
    }

    const { plateNumber, type, capacity, status } = await request.json();

    const updates = {};
    if (plateNumber) updates.plateNumber = plateNumber;
    if (type) updates.type = type;
    if (capacity) updates.capacity = Number(capacity);
    if (status) updates.status = status;

    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json({ message: 'Vehicle details updated.', vehicle: updatedVehicle });
  } catch (err) {
    console.error('Update vehicle error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agency = await Agency.findOne({ userId: session._id });
    if (!agency) {
      return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle || vehicle.agencyId.toString() !== agency._id.toString()) {
      return NextResponse.json({ error: 'Vehicle not found or access denied.' }, { status: 404 });
    }

    await Vehicle.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Vehicle removed successfully.' });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
