import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Adventure from '@/backend/models/Adventure';
import Agency from '@/backend/models/Agency';
import { getSession } from '@/backend/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = {};

    // Filters
    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { mountain: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const type = searchParams.get('type');
    if (type && type !== 'All') {
      query.adventureType = { $in: [type] };
    }

    const difficulty = searchParams.get('difficulty');
    if (difficulty) {
      query.difficulty = difficulty.toLowerCase();
    }

    const region = searchParams.get('region');
    if (region && region !== 'All regions') {
      query.region = region;
    }

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const date = searchParams.get('date');
    if (date) {
      // Find adventures starting on or after the selected date
      query.startDate = { $gte: new Date(date) };
    }

    const agencyId = searchParams.get('agencyId');
    if (agencyId) {
      query.agencyId = agencyId;
    }

    // Only active listings by default unless it's the agency requesting their own
    if (!agencyId) {
      query.status = 'active';
    }

    const adventures = await Adventure.find(query)
      .populate({
        path: 'agencyId',
        select: 'orgName contactPerson status description'
      })
      .sort({ startDate: 1 })
      .lean();

    return NextResponse.json({ adventures });
  } catch (err) {
    console.error('Fetch adventures error:', err);
    return NextResponse.json({ error: 'Failed to fetch adventures' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agency = await Agency.findOne({ userId: session._id });
    if (!agency || agency.status !== 'approved') {
      return NextResponse.json({ error: 'Agency profile is not approved yet.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title, mountain, adventureType, difficulty,
      startDate, endDate, price, maxSlots,
      inclusions, itinerary, image, status, location, region
    } = body;

    if (!title || !difficulty || !startDate || !endDate || !price || !maxSlots || !location) {
      return NextResponse.json({ error: 'Required fields are missing.' }, { status: 400 });
    }

    const adventure = await Adventure.create({
      agencyId: agency._id,
      title,
      mountain: mountain || '',
      adventureType: Array.isArray(adventureType) ? adventureType : [adventureType],
      difficulty: difficulty.toLowerCase(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      price: Number(price),
      maxSlots: Number(maxSlots),
      slotsRemaining: Number(maxSlots),
      inclusions: inclusions || '',
      itinerary: itinerary || '',
      image: image || '',
      status: status || 'active',
      location,
      region: region || 'Luzon',
    });

    return NextResponse.json({ message: 'Adventure listing created.', adventure }, { status: 201 });
  } catch (err) {
    console.error('Create adventure error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
