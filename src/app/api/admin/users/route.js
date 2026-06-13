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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookingCount = await Booking.countDocuments({ hikerId: user._id });

        // For agency users, attach the Agency _id for linking to the detail page
        let agencyId = null;
        if (user.role === 'agency') {
          const agency = await Agency.findOne({ userId: user._id }).select('_id orgName').lean();
          if (agency) {
            agencyId = agency._id;
          }
        }

        return { ...user, bookingCount, agencyId };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (err) {
    console.error('Fetch users admin error:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { userId, isActive } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: !!isActive },
      { new: true }
    ).select('-password');

    return NextResponse.json({ message: 'User status updated.', user: updatedUser });
  } catch (err) {
    console.error('Update user active status error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
