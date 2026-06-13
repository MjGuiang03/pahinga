import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Booking from '@/backend/models/Booking';
import Driver from '@/backend/models/Driver';
import Vehicle from '@/backend/models/Vehicle';
import { getSession } from '@/backend/lib/auth';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.agencyId.toString() !== session.agency?._id.toString()) {
      return NextResponse.json({ error: 'Forbidden. You do not own this booking.' }, { status: 403 });
    }

    const { driverId, vehicleId, pickupTime } = await request.json();

    if (!driverId || !vehicleId || !pickupTime) {
      return NextResponse.json({ error: 'Driver, vehicle, and pickup time are required.' }, { status: 400 });
    }

    // Verify driver is available
    const driver = await Driver.findById(driverId);
    if (!driver || driver.agencyId.toString() !== session.agency._id.toString()) {
      return NextResponse.json({ error: 'Invalid driver.' }, { status: 400 });
    }

    // Verify vehicle is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.agencyId.toString() !== session.agency._id.toString()) {
      return NextResponse.json({ error: 'Invalid vehicle.' }, { status: 400 });
    }

    booking.driverId = driverId;
    booking.vehicleId = vehicleId;
    booking.pickupTime = new Date(pickupTime);
    booking.transportStatus = 'assigned';

    await booking.save();

    return NextResponse.json({ message: 'Driver and vehicle assigned successfully.', booking });
  } catch (err) {
    console.error('Assign driver error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
