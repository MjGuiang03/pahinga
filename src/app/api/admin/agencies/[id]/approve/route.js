import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Agency from '@/backend/models/Agency';
import User from '@/backend/models/User';
import { getSession } from '@/backend/lib/auth';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agency = await Agency.findById(id);
    if (!agency) {
      return NextResponse.json({ error: 'Agency profile not found.' }, { status: 404 });
    }

    const { action, reason } = await request.json(); // action can be 'approve', 'reject', 'suspend', 'restore'

    if (!action) {
      return NextResponse.json({ error: 'Action is required.' }, { status: 400 });
    }

    if (action === 'approve') {
      agency.status = 'approved';
      agency.approvedAt = new Date();
      agency.rejectedReason = null;
      await User.findByIdAndUpdate(agency.userId, { isActive: true });
    } else if (action === 'reject') {
      agency.status = 'rejected';
      agency.rejectedReason = reason || 'Does not meet requirements';
    } else if (action === 'suspend') {
      agency.status = 'rejected';
      agency.rejectedReason = reason || 'Suspended by admin';
      await User.findByIdAndUpdate(agency.userId, { isActive: false });
    } else if (action === 'restore') {
      agency.status = 'approved';
      await User.findByIdAndUpdate(agency.userId, { isActive: true });
    } else {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    await agency.save();

    return NextResponse.json({ message: `Agency ${action}d successfully.`, agency });
  } catch (err) {
    console.error('Process agency action error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
