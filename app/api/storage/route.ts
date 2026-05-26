import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (!isAuthenticated(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let totalBytes = 0;
    let count = 0;
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const result = await list({ cursor, limit: 1000 });
      for (const blob of result.blobs) {
        totalBytes += blob.size;
        count++;
      }
      cursor = result.cursor;
      hasMore = result.hasMore;
    }

    return NextResponse.json({
      totalBytes,
      totalMB: totalBytes / (1024 * 1024),
      limitMB: 500,
      count,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch storage info' }, { status: 500 });
  }
}
