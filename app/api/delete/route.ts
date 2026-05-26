import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { isAuthenticated } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (!isAuthenticated(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url } = await request.json();
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  await del(url);

  return NextResponse.json({ success: true });
}
