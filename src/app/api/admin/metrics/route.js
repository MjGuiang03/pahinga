import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import User from '@/backend/models/User';
import Agency from '@/backend/models/Agency';
import Booking from '@/backend/models/Booking';
import { getSession } from '@/backend/lib/auth';

// Builds an array of the last N months: [{ label: 'Jan', year, month }, ...]
function lastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(), // 0-indexed
    });
  }
  return months;
}

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const months = lastNMonths(6);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // All bookings in the last 6 months
    const recentBookings = await Booking.find({ createdAt: { $gte: sixMonthsAgo } }).lean();

    // Monthly bookings count
    const monthlyBookings = months.map(m => ({
      label: m.label,
      value: recentBookings.filter(b => {
        const d = new Date(b.createdAt);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      }).length,
    }));

    // Monthly revenue (confirmed + completed)
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

    // Monthly new users
    const recentUsers = await User.find({ createdAt: { $gte: sixMonthsAgo } }).lean();
    const monthlyUsers = months.map(m => ({
      label: m.label,
      value: recentUsers.filter(u => {
        const d = new Date(u.createdAt);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      }).length,
    }));

    // All-time booking status breakdown
    const allBookings = await Booking.find({}).lean();
    const statusBreakdown = ['pending', 'confirmed', 'completed', 'cancelled'].map(s => ({
      label: s,
      value: allBookings.filter(b => b.status === s).length,
    }));

    // Top 5 agencies by all-time revenue
    const agencyRevMap = {};
    allBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .forEach(b => {
        const id = String(b.agencyId);
        agencyRevMap[id] = (agencyRevMap[id] || 0) + (b.totalAmount || 0);
      });

    const topAgencyIds = Object.entries(agencyRevMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topAgencies = await Agency.find({ _id: { $in: topAgencyIds } }).select('orgName _id').lean();
    const topAgenciesWithRevenue = topAgencies.map(a => ({
      name: a.orgName,
      revenue: agencyRevMap[String(a._id)] || 0,
      bookings: allBookings.filter(b => String(b.agencyId) === String(a._id)).length,
    })).sort((a, b) => b.revenue - a.revenue);

    // Summary KPIs
    const thisMonth = new Date();
    const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const lastMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);

    const bookingsThisMonth = allBookings.filter(b => new Date(b.createdAt) >= startOfMonth).length;
    const bookingsLastMonth = allBookings.filter(b => {
      const d = new Date(b.createdAt);
      return d >= lastMonthStart && d < startOfMonth;
    }).length;

    const revenueThisMonth = allBookings
      .filter(b => new Date(b.createdAt) >= startOfMonth && (b.status === 'confirmed' || b.status === 'completed'))
      .reduce((s, b) => s + (b.totalAmount || 0), 0);

    const revenueLastMonth = allBookings
      .filter(b => {
        const d = new Date(b.createdAt);
        return d >= lastMonthStart && d < startOfMonth && (b.status === 'confirmed' || b.status === 'completed');
      })
      .reduce((s, b) => s + (b.totalAmount || 0), 0);

    const usersThisMonth = recentUsers.filter(u => new Date(u.createdAt) >= startOfMonth).length;
    const usersLastMonth = recentUsers.filter(u => {
      const d = new Date(u.createdAt);
      return d >= lastMonthStart && d < startOfMonth;
    }).length;

    return NextResponse.json({
      monthlyBookings,
      monthlyRevenue,
      monthlyUsers,
      statusBreakdown,
      topAgencies: topAgenciesWithRevenue,
      kpis: {
        bookingsThisMonth, bookingsLastMonth,
        revenueThisMonth, revenueLastMonth,
        usersThisMonth, usersLastMonth,
        totalBookings: allBookings.length,
        totalRevenue: allBookings
          .filter(b => b.status === 'confirmed' || b.status === 'completed')
          .reduce((s, b) => s + (b.totalAmount || 0), 0),
      },
    });
  } catch (err) {
    console.error('Admin metrics error:', err);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
