import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Agency from '@/backend/models/Agency';
import Adventure from '@/backend/models/Adventure';
import Booking from '@/backend/models/Booking';
import { getSession } from '@/backend/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = {};

    const statusFilter = searchParams.get('status');
    if (statusFilter && statusFilter !== 'all') {
      query.status = statusFilter;
    }

    const agencies = await Agency.find(query)
      .populate({
        path: 'userId',
        select: 'name email phone avatar createdAt'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Map stats for each agency
    const agenciesWithStats = await Promise.all(
      agencies.map(async (agency) => {
        const listingCount = await Adventure.countDocuments({ agencyId: agency._id });
        const bookings = await Booking.find({ agencyId: agency._id });
        const bookingCount = bookings.length;
        const totalRevenue = bookings
          .filter(b => b.status === 'confirmed' || b.status === 'completed')
          .reduce((sum, b) => sum + b.totalAmount, 0);

        return {
          ...agency,
          listingCount,
          bookingCount,
          totalRevenue,
        };
      })
    );

    return NextResponse.json({ agencies: agenciesWithStats });
  } catch (err) {
    console.error('Fetch agencies admin error:', err);
    return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
  }
}
