import { NextResponse } from 'next/server';

const ULTRON_SERVER_URL = process.env.ULTRON_SERVER_URL || 'http://127.0.0.1:8742';

async function proxyRequest(req: Request, params: { path: string[] }) {
  const subPath = params.path.join('/');
  const targetUrl = `${ULTRON_SERVER_URL}/api/${subPath}`;

  const headers = new Headers(req.headers);
  headers.delete('host');

  try {
    const init: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = await req.text();
    }

    const res = await fetch(targetUrl, init);
    const contentType = res.headers.get('content-type') || 'application/json';
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: `Could not connect to Ultron Engine backend at ${ULTRON_SERVER_URL}. Is python -m routes.server running in D:\\code\\project-ultron? (${err.message})`,
      serverUrl: ULTRON_SERVER_URL
    }, { status: 503 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams);
}

export async function POST(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams);
}
