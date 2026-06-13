import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/backend/lib/db';
import User from '@/backend/models/User';
import { generateToken, setTokenCookie } from '@/backend/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Your account has been suspended.' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = generateToken(user);
    const cookie = setTokenCookie(token);

    const response = NextResponse.json({
      message: 'Login successful.',
      user: { id: user._id, name: user.name, role: user.role },
    });

    response.cookies.set(cookie);
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
