import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/backend/lib/db';
import User from '@/backend/models/User';
import Agency from '@/backend/models/Agency';
import { getSession } from '@/backend/lib/auth';

// GET /api/auth/settings — returns profile info for the logged-in user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session._id).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const result = { user };

    // Attach agency profile for agency users
    if (user.role === 'agency') {
      const agency = await Agency.findOne({ userId: user._id }).lean();
      result.agency = agency || null;
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// PUT /api/auth/settings — update profile & optionally change password
export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { name, phone, currentPassword, newPassword, orgName, contactPerson, description } = body;

    const user = await User.findById(session._id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Update basic fields
    if (name && name.trim()) user.name = name.trim();
    if (typeof phone !== 'undefined') user.phone = phone || null;

    // Password change (optional)
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password.' }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // Update agency profile if applicable
    if (user.role === 'agency') {
      const agency = await Agency.findOne({ userId: user._id });
      if (agency) {
        if (orgName && orgName.trim()) agency.orgName = orgName.trim();
        if (contactPerson && contactPerson.trim()) agency.contactPerson = contactPerson.trim();
        if (typeof description !== 'undefined') agency.description = description || null;
        await agency.save();
      }
    }

    return NextResponse.json({
      message: 'Settings updated successfully.',
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('Settings PUT error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
