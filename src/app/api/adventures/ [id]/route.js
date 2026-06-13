import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Adventure from '@/backend/models/Adventure';
import Agency from '@/backend/models/Agency';
import Review from '@/backend/models/Review';
import { getSession } from '@/backend/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    const adventure = await Adventure.findById(id)
      .populate({
        path: 'agencyId',
        select: 'orgName contactPerson status description'
      })
      .lean();

    if (!adventure) {
      return NextResponse.json({ error: 'Adventure not found.' }, { status: 404 });
    }

    // Fetch reviews for this adventure
    const reviews = await Review.find({ adventureId: id })
      .populate({
        path: 'hikerId',
        select: 'name avatar'
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ adventure, reviews });
  } catch (err) {
    console.error('Fetch adventure detail error:', err);
    return NextResponse.json({ error: 'Failed to fetch adventure details' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agency = await Agency.findOne({ userId: session._id });
    if (!agency) {
      return NextResponse.json({ error: 'Agency profile not found.' }, { status: 404 });
    }

    const adventure = await Adventure.findById(id);
    if (!adventure) {
      return NextResponse.json({ error: 'Adventure not found.' }, { status: 404 });
    }

    if (adventure.agencyId.toString() !== agency._id.toString()) {
      return NextResponse.json({ error: 'Forbidden. You do not own this listing.' }, { status: 403 });
    }

    const body = await request.json();
    const updates = {};
    const fields = [
      'title', 'mountain', 'adventureType', 'difficulty', 'startDate',
      'endDate', 'price', 'maxSlots', 'inclusions', 'itinerary',
      'image', 'status', 'location', 'region'
    ];

    fields.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          updates[field] = new Date(body[field]);
        } else if (field === 'price' || field === 'maxSlots') {
          updates[field] = Number(body[field]);
        } else {
          updates[field] = body[field];
        }
      }
    });

    // Recalculate slots remaining if max slots changed
    if (body.maxSlots !== undefined) {
      const difference = Number(body.maxSlots) - adventure.maxSlots;
      updates.slotsRemaining = Math.max(0, adventure.slotsRemaining + difference);
    }

    const updatedAdventure = await Adventure.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json({ message: 'Listing updated.', adventure: updatedAdventure });
  } catch (err) {
    console.error('Update adventure error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agency = await Agency.findOne({ userId: session._id });
    if (!agency) {
      return NextResponse.json({ error: 'Agency profile not found.' }, { status: 404 });
    }

    const adventure = await Adventure.findById(id);
    if (!adventure) {
      return NextResponse.json({ error: 'Adventure not found.' }, { status: 404 });
    }

    if (adventure.agencyId.toString() !== agency._id.toString()) {
      return NextResponse.json({ error: 'Forbidden. You do not own this listing.' }, { status: 403 });
    }

    await Adventure.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Listing deleted successfully.' });
  } catch (err) {
    console.error('Delete adventure error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
