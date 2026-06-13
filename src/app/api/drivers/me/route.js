import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Driver from '@/backend/models/Driver';
import Agency from '@/backend/models/Agency';
import { getSession } from '@/backend/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'driver') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const driver = await Driver.findOne({ userId: session._id })
      .populate({
        path: 'agencyId',
        select: 'orgName contactPerson'
      })
      .lean();

    if (!driver) {
      return NextResponse.json({ error: 'Driver profile not found.' }, { status: 404 });
    }

    return NextResponse.json({
      driver,
      user: {
        name: session.name,
        email: session.email,
        phone: session.phone
      }
    });
  } catch (err) {
    console.error('Fetch me driver profile error:', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
