import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/backend/lib/db';
import User from '@/backend/models/User';
import Agency from '@/backend/models/Agency';
import Driver from '@/backend/models/Driver';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();

    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user || !user.isActive) return null;

    // Attach agency data if applicable
    if (user.role === 'agency') {
      const agency = await Agency.findOne({ userId: user._id }).lean();
      user.agency = agency || null;
    } else if (user.role === 'driver') {
      const driver = await Driver.findOne({ userId: user._id }).lean();
      if (driver) {
        const agency = await Agency.findById(driver.agencyId).lean();
        driver.agencyName = agency ? agency.orgName : 'Independent';
        user.driver = driver;
      }
    }

    return user;
  } catch {
    return null;
  }
}

export function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function setTokenCookie(token) {
  return {
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  };
}
