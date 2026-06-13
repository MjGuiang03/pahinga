import { NextResponse } from 'next/server';
import { getSession } from '@/backend/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: session._id,
        name: session.name,
        email: session.email,
        phone: session.phone,
        role: session.role,
        avatar: session.avatar,
        agency: session.agency || null,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
