import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getUserByEmail, upsertUserOnLogin } from '../../../../lib/users';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userDoc = await getUserByEmail(session.user.email);
    if (!userDoc) {
      userDoc = await upsertUserOnLogin(session.user.email, session.user.name || undefined);
    }

    return NextResponse.json({
      success: true,
      user: {
        email: userDoc.email,
        name: userDoc.name,
        role: userDoc.role,
        status: userDoc.status,
        createdAt: userDoc.createdAt,
        lastLoginAt: userDoc.lastLoginAt,
        settings: userDoc.settings || null
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    const userDoc = await upsertUserOnLogin(session.user.email, name);

    return NextResponse.json({
      success: true,
      user: userDoc
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
