import { NextRequest, NextResponse } from 'next/server';
import { list, put, del } from '@vercel/blob';

export const dynamic = 'force-dynamic';

const PREFIX = '__reservations';

type Reservations = Record<string, { reservedBy: string }>;

async function fetchReservations(): Promise<Reservations> {
  try {
    const { blobs } = await list({ prefix: PREFIX });
    if (!blobs.length) return {};
    blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    const res = await fetch(blobs[0].url, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
    return await res.json();
  } catch {
    return {};
  }
}

export async function GET() {
  const data = await fetchReservations();
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}

export async function POST(request: NextRequest) {
  const { url, reservedBy } = await request.json() as { url: string; reservedBy: string | null };

  const data = await fetchReservations();

  if (!reservedBy) {
    delete data[url];
  } else {
    data[url] = { reservedBy };
  }

  // Delete all existing reservation blobs then write a fresh one
  const { blobs } = await list({ prefix: PREFIX });
  await Promise.all(blobs.map((b) => del(b.url)));

  await put(`${PREFIX}.json`, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'application/json',
  });

  return NextResponse.json({ ok: true });
}
