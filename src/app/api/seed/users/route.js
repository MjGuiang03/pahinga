import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/backend/lib/db';
import User from '@/backend/models/User';
import Agency from '@/backend/models/Agency';

// GET /api/seed/users
// Creates driver1@pahinga.com and agency@pahinga.com with password "12345"
// Idempotent — skips accounts that already exist
// GET /api/seed/users?force=true
// Creates OR resets driver1@pahinga.com and agency@pahinga.com with password "12345"
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const password = '12345';
    const hashed = await bcrypt.hash(password, 10);
    const results = [];

    // ── Driver account ──
    const driverEmail = 'driver1@pahinga.com';
    const existingDriver = await User.findOne({ email: driverEmail });
    if (existingDriver) {
      if (force) {
        await User.updateOne({ email: driverEmail }, { password: hashed, isActive: true, role: 'driver' });
        results.push({ email: driverEmail, status: '🔄 password reset' });
      } else {
        results.push({ email: driverEmail, status: 'skipped — already exists (add ?force=true to reset password)' });
      }
    } else {
      await User.create({
        name: 'Juan Driver',
        email: driverEmail,
        password: hashed,
        phone: '09171234567',
        role: 'driver',
        isActive: true,
      });
      results.push({ email: driverEmail, status: '✅ created' });
    }

    // ── Agency account ──
    const agencyEmail = 'agency@pahinga.com';
    const existingAgencyUser = await User.findOne({ email: agencyEmail });
    if (existingAgencyUser) {
      if (force) {
        await User.updateOne({ email: agencyEmail }, { password: hashed, isActive: true, role: 'agency' });
        // Ensure Agency profile exists and is approved
        const agencyProfile = await Agency.findOne({ userId: existingAgencyUser._id });
        if (!agencyProfile) {
          await Agency.create({
            userId: existingAgencyUser._id,
            orgName: 'Trail Seekers PH',
            contactPerson: 'Trail Seekers PH',
            description: 'Seed agency account for testing.',
            status: 'approved',
            approvedAt: new Date(),
          });
        } else {
          await Agency.updateOne({ userId: existingAgencyUser._id }, { status: 'approved', approvedAt: new Date() });
        }
        results.push({ email: agencyEmail, status: '🔄 password reset + agency profile approved' });
      } else {
        results.push({ email: agencyEmail, status: 'skipped — already exists (add ?force=true to reset password)' });
      }
    } else {
      const agencyUser = await User.create({
        name: 'Trail Seekers PH',
        email: agencyEmail,
        password: hashed,
        phone: '09281234567',
        role: 'agency',
        isActive: true,
      });
      await Agency.create({
        userId: agencyUser._id,
        orgName: 'Trail Seekers PH',
        contactPerson: 'Trail Seekers PH',
        description: 'Seed agency account for testing.',
        status: 'approved',
        approvedAt: new Date(),
      });
      results.push({ email: agencyEmail, status: '✅ created (User + Agency profile)' });
    }

    return NextResponse.json({ message: 'Seed processed.', password: '12345', results });
  } catch (err) {
    console.error('User seed error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

