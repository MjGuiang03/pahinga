import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Booking from '@/backend/models/Booking';
import { getSession } from '@/backend/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const booking = await Booking.findById(id)
      .populate({
        path: 'adventureId',
        select: 'title startDate endDate price location difficulty image inclusions itinerary'
      })
      .populate({
        path: 'agencyId',
        select: 'orgName contactPerson description'
      })
      .populate({
        path: 'hikerId',
        select: 'name email phone avatar'
      })
      .populate({
        path: 'driverId',
        select: 'name phone licenseNumber'
      })
      .populate({
        path: 'vehicleId',
        select: 'plateNumber type capacity'
      })
      .lean();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    // Authorization checks
    const isHiker = session.role === 'hiker' && booking.hikerId._id.toString() === session._id.toString();
    const isAdmin = session.role === 'admin';
    const isAgency = session.role === 'agency' && booking.agencyId._id.toString() === session.agency?._id.toString();
    const isDriver = session.role === 'driver' && booking.driverId?._id.toString() === session.driver?._id.toString();

    if (!isHiker && !isAdmin && !isAgency && !isDriver) {
      return NextResponse.json({ error: 'Forbidden. You do not have access to this booking.' }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (err) {
    console.error('Fetch booking detail error:', err);
    return NextResponse.json({ error: 'Failed to fetch booking details' }, { status: 500 });
  }
}
