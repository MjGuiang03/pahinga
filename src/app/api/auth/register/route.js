import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/backend/lib/db';
import User from '@/backend/models/User';
import { generateToken, setTokenCookie } from '@/backend/lib/auth';

export async function POST(request) {
  try {
    const { name, email, password, confirmPassword, phone } = await request.json();

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
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

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: 'hiker',
    });

    const token = generateToken(user);
    const cookie = setTokenCookie(token);

    const response = NextResponse.json({
      message: 'Account created successfully.',
      user: { id: user._id, name: user.name, role: user.role },
    }, { status: 201 });

    response.cookies.set(cookie);
    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
