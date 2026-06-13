import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Booking from '@/backend/models/Booking';
import { getSession } from '@/backend/lib/auth';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await dbConnect();
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const { action, remarks } = await request.json(); // action can be 'approve' or 'reject'

    if (!action) {
      return NextResponse.json({ error: 'Action is required.' }, { status: 400 });
    }

    if (!booking.refundRequest || booking.refundRequest.status !== 'pending') {
      return NextResponse.json({ error: 'No pending refund request found.' }, { status: 400 });
    }

    if (action === 'approve') {
      booking.refundRequest.status = 'approved';
      booking.refundRequest.remarks = remarks || 'Refund approved by administrator';
      booking.refundRequest.processedAt = new Date();
      booking.paymentStatus = 'refunded';
    } else if (action === 'reject') {
      booking.refundRequest.status = 'rejected';
      booking.refundRequest.remarks = remarks || 'Refund rejected by administrator';
      booking.refundRequest.processedAt = new Date();
    } else {
      return NextResponse.json({ error: 'Invalid action. Use approve or reject.' }, { status: 400 });
    }

    await booking.save();
    return NextResponse.json({ message: `Refund request ${action}d successfully.`, booking });
  } catch (err) {
    console.error('Process refund error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
