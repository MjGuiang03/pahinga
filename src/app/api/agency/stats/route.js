import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Booking from '@/backend/models/Booking';
import Adventure from '@/backend/models/Adventure';
import Agency from '@/backend/models/Agency';
import { getSession } from '@/backend/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agency = await Agency.findOne({ userId: session._id });
    if (!agency) {
      return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 });
    }

    const agencyId = agency._id;

    // Start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Bookings this month
    const bookingsThisMonth = await Booking.find({
      agencyId,
      createdAt: { $gte: startOfMonth }
    });

    const totalBookingsCount = bookingsThisMonth.length;

    // Revenue this month (confirmed or completed bookings)
    const revenueThisMonth = bookingsThisMonth
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    // Pending bookings
    const pendingBookingsCount = await Booking.countDocuments({
      agencyId,
      status: 'pending'
    });

    // Active listings
    const activeListingsCount = await Adventure.countDocuments({
      agencyId,
      status: 'active'
    });

    // Average rating
    const adventures = await Adventure.find({ agencyId });
    const ratedAdventures = adventures.filter(a => a.reviewCount > 0);
    const avgRating = ratedAdventures.length > 0
      ? Number((ratedAdventures.reduce((sum, a) => sum + a.rating, 0) / ratedAdventures.length).toFixed(1))
      : 0;

    return NextResponse.json({
      totalBookingsCount,
      revenueThisMonth,
      pendingBookingsCount,
      activeListingsCount,
      avgRating,
      orgName: agency.orgName
    });
  } catch (err) {
    console.error('Fetch agency stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch agency stats' }, { status: 500 });
  }
}
