import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Agency from '@/backend/models/Agency';
import Driver from '@/backend/models/Driver';
import { getSession } from '@/backend/lib/auth';

// GET /api/admin/users/[userId]/agency-members
// Returns the drivers linked to the agency owned by this user
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { userId } = params;

    // Find the agency owned by this user account
    const agency = await Agency.findOne({ userId }).lean();
    if (!agency) {
      return NextResponse.json({ drivers: [] });
    }

    // Get all drivers under that agency
    const drivers = await Driver.find({ agencyId: agency._id })
      .populate({ path: 'userId', select: 'name email isActive' })
      .lean();

    return NextResponse.json({ drivers, agencyId: agency._id });
  } catch (err) {
    console.error('Agency members fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch agency members' }, { status: 500 });
  }
}
