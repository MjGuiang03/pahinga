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

    const { name, licenseNumber, phone, email, role } = await request.json();

    if (!name || !phone || !email || (role !== 'coordinator' && !licenseNumber)) {
      return NextResponse.json({ error: 'Name, phone number, and account email are required. Drivers must also provide a license number.' }, { status: 400 });
    }

    const linkedUser = await User.findOne({ email });
    if (!linkedUser) {
      return NextResponse.json({ error: `No user account found with that email. Please ensure the ${role} has registered a Pahinga account first.` }, { status: 404 });
    }

    if (['admin', 'agency'].includes(linkedUser.role)) {
      return NextResponse.json({ error: 'Cannot link an admin or agency account.' }, { status: 400 });
    }

    // Check if driver/coordinator is already registered under any agency
    const existingDriverLink = await Driver.findOne({ userId: linkedUser._id });
    if (existingDriverLink) {
      return NextResponse.json({ error: `This account is already linked to an agency as a ${existingDriverLink.role}.` }, { status: 400 });
    }

    // Upgrade their user role to match their new job (using updateOne to bypass cached Mongoose enum validators)
    await User.updateOne({ _id: linkedUser._id }, { $set: { role: role || 'driver' } });

    const driver = await Driver.create({
      agencyId: agency._id,
      name,
      licenseNumber: licenseNumber || 'N/A',
      phone,
      role: role || 'driver',
      userId: linkedUser._id,
      status: 'available',
    });

    return NextResponse.json({ message: 'Driver added successfully.', driver }, { status: 201 });
  } catch (err) {
    console.error('Create driver error:', err);
    return NextResponse.json({ error: err.message || 'Something went wrong.' }, { status: 500 });
  }
}
