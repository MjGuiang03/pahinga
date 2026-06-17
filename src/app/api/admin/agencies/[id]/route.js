import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Agency from '@/backend/models/Agency';
import Driver from '@/backend/models/Driver';
import Adventure from '@/backend/models/Adventure';
import Booking from '@/backend/models/Booking';
import { getSession } from '@/backend/lib/auth';

// GET /api/admin/agencies/[id]
// Returns full agency profile + drivers + stats
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params; // Next.js 15: params is a Promise

    // Try by agency _id first
    let agency = null;
    try {
      agency = await Agency.findById(id)
        .populate({ path: 'userId', select: 'name email phone avatar createdAt isActive role' })
        .lean();
    } catch (_) {
      // id is not a valid ObjectId — fall through to userId lookup
    }

    // Fallback: URL may contain the User _id instead of Agency _id
    if (!agency) {
      agency = await Agency.findOne({ userId: id })
        .populate({ path: 'userId', select: 'name email phone avatar createdAt isActive role' })
        .lean();
    }

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    // Use the resolved agency._id for all subsequent queries
    const agencyId = agency._id;

    const drivers = await Driver.find({ agencyId })
      .populate({ path: 'userId', select: 'name email isActive createdAt' })
      .lean();

    const listings = await Adventure.countDocuments({ agencyId });
    const bookings = await Booking.find({ agencyId }).lean();
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return NextResponse.json({
      agency,
      drivers,
      stats: {
        listings,
        bookings: bookings.length,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error('Fetch agency detail error:', err);
    return NextResponse.json({ error: 'Failed to fetch agency details' }, { status: 500 });
  }
}
