import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Booking from '@/backend/models/Booking';
import Review from '@/backend/models/Review';
import Adventure from '@/backend/models/Adventure';
import { getSession } from '@/backend/lib/auth';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'hiker') {
      return NextResponse.json({ error: 'Unauthorized. Hiker account required.' }, { status: 401 });
    }

    await dbConnect();
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.hikerId.toString() !== session._id.toString()) {
      return NextResponse.json({ error: 'Forbidden. You do not own this booking.' }, { status: 403 });
    }

    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'You can only review completed trips.' }, { status: 400 });
    }

    if (booking.reviewLeft) {
      return NextResponse.json({ error: 'You have already left a review for this booking.' }, { status: 400 });
    }

    const { rating, comment } = await request.json();

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required.' }, { status: 400 });
    }

    const review = await Review.create({
      hikerId: session._id,
      adventureId: booking.adventureId,
      agencyId: booking.agencyId,
      rating: Number(rating),
      comment,
    });

    booking.reviewLeft = true;
    await booking.save();

    // Recalculate adventure ratings
    const adventureReviews = await Review.find({ adventureId: booking.adventureId });
    const totalRating = adventureReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = (totalRating / adventureReviews.length).toFixed(1);

    await Adventure.findByIdAndUpdate(booking.adventureId, {
      rating: Number(avgRating),
      reviewCount: adventureReviews.length,
    });

    return NextResponse.json({ message: 'Review submitted successfully.', review });
  } catch (err) {
    console.error('Leave review error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
