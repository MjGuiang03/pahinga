import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Review from '@/backend/models/Review';
import { getSession } from '@/backend/lib/auth';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { flagged } = body;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }

    review.flagged = !!flagged;
    await review.save();

    return NextResponse.json({ message: 'Review status updated.', review });
  } catch (err) {
    console.error('Update review error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await dbConnect();
    await Review.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('Delete review error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
