import { NextRequest, NextResponse } from 'next/server';
import { readMetadata, writeMetadata } from '@/lib/metadata';
import { isAuthenticated } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (!isAuthenticated(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // body: { [pathname]: tokenId | "" }  — empty string removes the mapping
  const updates: Record<string, string> = await request.json();
  const current = await readMetadata();

  for (const [pathname, tokenId] of Object.entries(updates)) {
    if (tokenId === '') {
      delete current[pathname];
    } else {
      current[pathname] = tokenId;
    }
  }

  await writeMetadata(current);
  return NextResponse.json({ ok: true });
}
