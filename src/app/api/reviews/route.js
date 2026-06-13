import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Review from '@/backend/models/Review';
import Agency from '@/backend/models/Agency';
import { getSession } from '@/backend/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const query = {};

    const adventureId = searchParams.get('adventureId');
    if (adventureId) {
      query.adventureId = adventureId;
    }

    const agencyId = searchParams.get('agencyId');
    if (agencyId) {
      query.agencyId = agencyId;
    }

    // Role-specific viewing
    if (!adventureId && !agencyId) {
      if (session) {
        if (session.role === 'agency') {
          const agency = await Agency.findOne({ userId: session._id });
          if (agency) {
            query.agencyId = agency._id;
          }
        }
        // Admin gets all reviews
      }
    }

    const reviews = await Review.find(query)
      .populate({
        path: 'hikerId',
        select: 'name email avatar'
      })
      .populate({
        path: 'adventureId',
        select: 'title'
      })
      .populate({
        path: 'agencyId',
        select: 'orgName'
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reviews });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
