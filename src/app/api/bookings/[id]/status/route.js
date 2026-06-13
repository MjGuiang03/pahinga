import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Booking from '@/backend/models/Booking';
import Adventure from '@/backend/models/Adventure';
import Agency from '@/backend/models/Agency';
import Driver from '@/backend/models/Driver';
import { getSession } from '@/backend/lib/auth';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const booking = await Booking.findById(id).populate('adventureId');
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const body = await request.json();
    const { status, transportStatus } = body;

    // 1. Cancel booking flow
    if (status === 'cancelled') {
      const isHiker = session.role === 'hiker' && booking.hikerId.toString() === session._id.toString();
      const isAdmin = session.role === 'admin';
      const isAgency = session.role === 'agency' && booking.agencyId.toString() === session.agency?._id.toString();

      if (!isHiker && !isAdmin && !isAgency) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (isHiker) {
        // Hiker can only cancel if pending/confirmed and >24hrs before trip
        const hoursDiff = (new Date(booking.adventureId.startDate) - new Date()) / (1000 * 60 * 60);
        if (booking.status !== 'pending' && booking.status !== 'confirmed') {
          return NextResponse.json({ error: 'Cannot cancel a completed or already cancelled booking.' }, { status: 400 });
        }
        if (hoursDiff < 24) {
          return NextResponse.json({ error: 'Cancellations must be done at least 24 hours before the trip.' }, { status: 400 });
        }
      }

      // Restore adventure slots
      await Adventure.findByIdAndUpdate(booking.adventureId._id, {
        $inc: { slotsRemaining: booking.paxCount }
      });

      booking.status = 'cancelled';
      
      // If paid, create a pending refund request automatically
      if (booking.paymentStatus === 'paid' && booking.paymentMethod !== 'arrival') {
        booking.refundRequest = {
          status: 'pending',
          amount: booking.totalAmount,
          reason: isHiker ? 'Hiker cancellation' : 'Agency cancellation',
          remarks: 'Automated request on cancellation',
        };
      }

      await booking.save();
      return NextResponse.json({ message: 'Booking cancelled successfully.', booking });
    }

    // 2. Confirm booking flow (Agency only)
    if (status === 'confirmed') {
      const isAgency = session.role === 'agency' && booking.agencyId.toString() === session.agency?._id.toString();
      const isAdmin = session.role === 'admin';
      if (!isAgency && !isAdmin) {
        return NextResponse.json({ error: 'Only the agency or admin can confirm bookings.' }, { status: 403 });
      }

      booking.status = 'confirmed';
      await booking.save();
      return NextResponse.json({ message: 'Booking confirmed.', booking });
    }

    // 3. Transport status updates (Driver or Agency)
    if (transportStatus) {
      const isAgency = session.role === 'agency' && booking.agencyId.toString() === session.agency?._id.toString();
      const isDriver = session.role === 'driver' && booking.driverId?.toString() === session.driver?._id.toString();
      const isAdmin = session.role === 'admin';

      if (!isAgency && !isDriver && !isAdmin) {
        return NextResponse.json({ error: 'Unauthorized to update transport status.' }, { status: 403 });
      }

      booking.transportStatus = transportStatus;

      if (transportStatus === 'picked_up') {
        // Update driver/vehicle status if they are assigned
        if (booking.driverId) await Driver.findByIdAndUpdate(booking.driverId, { status: 'on_trip' });
      }

      if (transportStatus === 'dropped_off') {
        booking.status = 'completed';
        // Driver and vehicle become available again
        if (booking.driverId) await Driver.findByIdAndUpdate(booking.driverId, { status: 'available' });
        // Complete payment if pay on arrival
        if (booking.paymentMethod === 'arrival') {
          booking.paymentStatus = 'paid';
        }
      }

      await booking.save();
      return NextResponse.json({ message: `Transport status updated to ${transportStatus}.`, booking });
    }

    return NextResponse.json({ error: 'No valid action provided.' }, { status: 400 });
  } catch (err) {
    console.error('Update booking status error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
