import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Driver from '@/backend/models/Driver';
import User from '@/backend/models/User';
import Agency from '@/backend/models/Agency';
import { getSession } from '@/backend/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agency = await Agency.findOne({ userId: session._id });
    if (!agency) {
      return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 });
    }

    const drivers = await Driver.find({ agencyId: agency._id })
      .populate({
        path: 'userId',
        select: 'email name'
      })
      .lean();

    return NextResponse.json({ drivers });
  } catch (err) {
    console.error('Fetch drivers error:', err);
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
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
    if (!agency) {
      return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 });
    }

    const { name, licenseNumber, phone, email } = await request.json();

    if (!name || !licenseNumber || !phone) {
      return NextResponse.json({ error: 'Name, license number, and phone number are required.' }, { status: 400 });
    }

    let linkedUser = null;
    if (email) {
      linkedUser = await User.findOne({ email, role: 'driver' });
      if (!linkedUser) {
        return NextResponse.json({ error: 'No driver user account found with that email. Please ensure the driver has registered with a driver role first.' }, { status: 404 });
      }

      // Check if driver is already registered under another agency
      const existingDriverLink = await Driver.findOne({ userId: linkedUser._id });
      if (existingDriverLink) {
        return NextResponse.json({ error: 'This driver account is already linked to an agency.' }, { status: 400 });
      }
    }

    const driver = await Driver.create({
      agencyId: agency._id,
      name,
      licenseNumber,
      phone,
      userId: linkedUser ? linkedUser._id : null,
      status: 'available',
    });

    return NextResponse.json({ message: 'Driver added successfully.', driver }, { status: 201 });
  } catch (err) {
    console.error('Create driver error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
