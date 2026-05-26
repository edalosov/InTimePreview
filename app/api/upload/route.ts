import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isAuthenticated } from '@/lib/auth';

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (!isAuthenticated(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string | null;

  if (!file || !title?.trim()) {
    return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const slug = titleToSlug(title) || 'untitled';
  const filename = `${Date.now()}__${slug}.${ext}`;

  try {
    const blob = await put(filename, file, { access: 'public' });
    return NextResponse.json({ url: blob.url, title: title.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Blob storage error';
    console.error('Upload error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
