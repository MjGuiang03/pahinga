import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Booking from '@/backend/models/Booking';
import Adventure from '@/backend/models/Adventure';
import Agency from '@/backend/models/Agency';
import Driver from '@/backend/models/Driver';
import { getSession } from '@/backend/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = {};

    if (session.role === 'hiker') {
      query.hikerId = session._id;
    } else if (session.role === 'agency') {
      const agency = await Agency.findOne({ userId: session._id });
      if (!agency) {
        return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 });
      }
      query.agencyId = agency._id;
    } else if (session.role === 'driver') {
      const driver = await Driver.findOne({ userId: session._id });
      if (!driver) {
        return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 });
      }
      query.driverId = driver._id;
    } else if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Optional status filter
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'adventureId',
        select: 'title startDate endDate price location difficulty image'
      })
      .populate({
        path: 'agencyId',
        select: 'orgName contactPerson'
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
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error('Fetch bookings error:', err);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'hiker') {
      return NextResponse.json({ error: 'Unauthorized. Hiker account required.' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const {
      adventureId, paxCount, pickupNeeded, pickupAddress,
      paymentMethod, gcashReference, cardNumber
    } = body;

    if (!adventureId || !paxCount || !paymentMethod) {
      return NextResponse.json({ error: 'Required fields are missing.' }, { status: 400 });
    }

    const adventure = await Adventure.findById(adventureId);
    if (!adventure) {
      return NextResponse.json({ error: 'Adventure not found.' }, { status: 404 });
    }

    if (adventure.status !== 'active') {
      return NextResponse.json({ error: 'Adventure is no longer active.' }, { status: 400 });
    }

    if (adventure.slotsRemaining < paxCount) {
      return NextResponse.json({ error: 'Not enough slots remaining.' }, { status: 400 });
    }

    // Generate unique reference number
    const refNum = `PH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const totalAmount = adventure.price * Number(paxCount);

    const booking = await Booking.create({
      referenceNumber: refNum,
      hikerId: session._id,
      adventureId: adventure._id,
      agencyId: adventure.agencyId,
      paxCount: Number(paxCount),
      totalAmount,
      pickupNeeded: !!pickupNeeded,
      pickupAddress: pickupNeeded ? pickupAddress : null,
      status: 'pending',
      paymentMethod,
      paymentStatus: paymentMethod === 'arrival' ? 'unpaid' : 'paid', // GCash/Card marked as paid mock
      gcashReference: paymentMethod === 'gcash' ? gcashReference : null,
      cardNumber: paymentMethod === 'card' ? (cardNumber ? cardNumber.slice(-4) : '4111') : null,
    });

    // Update adventure slots remaining
    await Adventure.findByIdAndUpdate(adventureId, {
      $inc: { slotsRemaining: -Number(paxCount) }
    });

    return NextResponse.json({ message: 'Booking completed successfully.', booking }, { status: 201 });
  } catch (err) {
    console.error('Create booking error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
