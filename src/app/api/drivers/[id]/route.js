import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Driver from '@/backend/models/Driver';
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

    const driver = await Driver.findById(id);
    if (!driver || driver.agencyId.toString() !== agency._id.toString()) {
      return NextResponse.json({ error: 'Driver not found or access denied.' }, { status: 404 });
    }

    const { name, licenseNumber, phone, status } = await request.json();

    const updates = {};
    if (name) updates.name = name;
    if (licenseNumber) updates.licenseNumber = licenseNumber;
    if (phone) updates.phone = phone;
    if (status) updates.status = status;

    const updatedDriver = await Driver.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json({ message: 'Driver details updated.', driver: updatedDriver });
  } catch (err) {
    console.error('Update driver error:', err);
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

    const driver = await Driver.findById(id);
    if (!driver || driver.agencyId.toString() !== agency._id.toString()) {
      return NextResponse.json({ error: 'Driver not found or access denied.' }, { status: 404 });
    }

    await Driver.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Driver removed successfully.' });
  } catch (err) {
    console.error('Delete driver error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
