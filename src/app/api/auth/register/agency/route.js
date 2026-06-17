import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/backend/lib/db';
import User from '@/backend/models/User';
import Agency from '@/backend/models/Agency';
import Notification from '@/backend/models/Notification';
import { generateToken, setTokenCookie } from '@/backend/lib/auth';

export async function POST(request) {
  try {
    const { orgName, email, password, confirmPassword, contactPerson, phone, description, businessPermit } = await request.json();

    if (!orgName || !email || !password || !confirmPassword || !contactPerson) {
      return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: contactPerson,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: 'agency',
    });

    // Create agency profile
    await Agency.create({
      userId: user._id,
      orgName,
      contactPerson,
      description: description || null,
      businessPermit: businessPermit || null,
    });


    // Notify admin(s)
    const admins = await User.find({ role: 'admin' }).select('_id');
    const notifications = admins.map(admin => ({
      userId: admin._id,
      type: 'new_agency_registration',
      title: 'New Agency Registration',
      message: `${orgName} has registered and is awaiting approval.`,
      link: '/admin/agencies',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    const token = generateToken(user);
    const cookie = setTokenCookie(token);

    const response = NextResponse.json({
      message: 'Agency registration submitted.',
      user: { id: user._id, name: user.name, role: user.role },
    }, { status: 201 });

    response.cookies.set(cookie);
    return response;
  } catch (err) {
    console.error('Agency register error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
