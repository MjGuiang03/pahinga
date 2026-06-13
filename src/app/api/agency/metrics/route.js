import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Booking from '@/backend/models/Booking';
import Adventure from '@/backend/models/Adventure';
import Review from '@/backend/models/Review';
import Agency from '@/backend/models/Agency';
import { getSession } from '@/backend/lib/auth';

function lastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() });
  }
  return months;
}

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agency = await Agency.findOne({ userId: session._id });
    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 });

    const agencyId = agency._id;
    const months = lastNMonths(6);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // All bookings for this agency
    const allBookings = await Booking.find({ agencyId }).lean();
    const recentBookings = allBookings.filter(b => new Date(b.createdAt) >= sixMonthsAgo);

    // Monthly bookings
    const monthlyBookings = months.map(m => ({
      label: m.label,
      value: recentBookings.filter(b => {
        const d = new Date(b.createdAt);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      }).length,
    }));

    // Monthly revenue
    const monthlyRevenue = months.map(m => ({
      label: m.label,
      value: recentBookings
        .filter(b => {
          const d = new Date(b.createdAt);
          return d.getFullYear() === m.year && d.getMonth() === m.month
            && (b.status === 'confirmed' || b.status === 'completed');
        })
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    }));

    // Booking status breakdown
    const statusBreakdown = ['pending', 'confirmed', 'completed', 'cancelled'].map(s => ({
      label: s,
      value: allBookings.filter(b => b.status === s).length,
    }));

    // Top 5 adventures by booking count
    const adventureBookingMap = {};
    allBookings.forEach(b => {
      const id = String(b.adventureId);
      adventureBookingMap[id] = (adventureBookingMap[id] || 0) + 1;
    });

    const topAdventureIds = Object.entries(adventureBookingMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topAdventures = await Adventure.find({ _id: { $in: topAdventureIds } })
      .select('title rating reviewCount').lean();

    const topAdventuresWithStats = topAdventures.map(a => ({
      title: a.title,
      bookings: adventureBookingMap[String(a._id)] || 0,
      rating: a.rating || 0,
      reviewCount: a.reviewCount || 0,
      revenue: allBookings
        .filter(b => String(b.adventureId) === String(a._id) && (b.status === 'confirmed' || b.status === 'completed'))
        .reduce((s, b) => s + (b.totalAmount || 0), 0),
    })).sort((a, b) => b.bookings - a.bookings);

    // KPIs with MoM comparison
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const bThisMonth = allBookings.filter(b => new Date(b.createdAt) >= startOfMonth);
    const bLastMonth = allBookings.filter(b => {
      const d = new Date(b.createdAt);
      return d >= lastMonthStart && d < startOfMonth;
    });

    const completionRate = allBookings.length
      ? Math.round((allBookings.filter(b => b.status === 'completed').length / allBookings.length) * 100)
      : 0;

    // Overall avg rating
    const adventures = await Adventure.find({ agencyId }).lean();
    const rated = adventures.filter(a => a.reviewCount > 0);
    const avgRating = rated.length
      ? Number((rated.reduce((s, a) => s + a.rating, 0) / rated.length).toFixed(1))
      : 0;

    return NextResponse.json({
      monthlyBookings,
      monthlyRevenue,
      statusBreakdown,
      topAdventures: topAdventuresWithStats,
      kpis: {
        bookingsThisMonth: bThisMonth.length,
        bookingsLastMonth: bLastMonth.length,
        revenueThisMonth: bThisMonth
          .filter(b => b.status === 'confirmed' || b.status === 'completed')
          .reduce((s, b) => s + (b.totalAmount || 0), 0),
        revenueLastMonth: bLastMonth
          .filter(b => b.status === 'confirmed' || b.status === 'completed')
          .reduce((s, b) => s + (b.totalAmount || 0), 0),
        totalBookings: allBookings.length,
        totalRevenue: allBookings
          .filter(b => b.status === 'confirmed' || b.status === 'completed')
          .reduce((s, b) => s + (b.totalAmount || 0), 0),
        completionRate,
        avgRating,
      },
    });
  } catch (err) {
    console.error('Agency metrics error:', err);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
