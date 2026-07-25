import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getUserByEmail, saveUserSettingsInDb } from '../../../../lib/users';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userDoc = await getUserByEmail(session.user.email);

    return NextResponse.json({
      success: true,
      settings: userDoc?.settings || null
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

    const settings = await req.json();
    const saved = await saveUserSettingsInDb(session.user.email, settings);

    return NextResponse.json({
      success: saved,
      message: saved ? 'User settings saved to MongoDB successfully.' : 'Failed to save settings.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
