import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { saveScanRecordToDb, getScansFromDb } from '../../../lib/scans';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || undefined;
    const scans = await getScansFromDb(userEmail);
    return NextResponse.json({ success: true, scans });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch scans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const scanData = {
      repoId: body.repoId || 'repo-' + Math.random().toString(36).substring(7),
      repoName: body.repoName || 'unknown-repo',
      repoUrl: body.repoUrl || 'https://github.com/user/repo',
      userEmail: session?.user?.email || body.userEmail || 'operator@ultron.io',
      mode: body.mode || 'cloud',
      language: body.language || 'TypeScript',
      status: body.status || 'Alert',
      score: body.score ?? 54,
      criticalCount: body.criticalCount ?? 1,
      highCount: body.highCount ?? 0,
      mediumCount: body.mediumCount ?? 0,
      lowCount: body.lowCount ?? 0,
      filesCount: body.filesCount ?? 12,
      linesCount: body.linesCount ?? 1540,
      findings: body.findings || []
    };

    const savedRecord = await saveScanRecordToDb(scanData);

    return NextResponse.json({
      success: true,
      message: 'Repository scan data stored in MongoDB Atlas successfully.',
      scan: savedRecord
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to store scan data' }, { status: 500 });
  }
}
