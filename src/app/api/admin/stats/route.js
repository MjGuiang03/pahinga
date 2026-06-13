import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import User from '@/backend/models/User';
import Agency from '@/backend/models/Agency';
import Booking from '@/backend/models/Booking';
import { getSession } from '@/backend/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await dbConnect();

    const totalUsers = await User.countDocuments({});
    const totalAgencies = await Agency.countDocuments({ status: 'approved' });
    const totalBookings = await Booking.countDocuments({});

    const allBookings = await Booking.find({});
    const totalRevenue = allBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const pendingAgencies = await Agency.countDocuments({ status: 'pending' });
    const openRefunds = await Booking.countDocuments({ 'refundRequest.status': 'pending' });

    // Recent platform bookings (last 10)
    const recentBookings = await Booking.find({})
      .populate({
        path: 'adventureId',
        select: 'title startDate'
      })
      .populate({
        path: 'hikerId',
        select: 'name email'
      })
      .populate({
        path: 'agencyId',
        select: 'orgName'
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      totalUsers,
      totalAgencies,
      totalBookings,
      totalRevenue,
      pendingAgencies,
      openRefunds,
      recentBookings
    });
  } catch (err) {
    console.error('Fetch admin stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
