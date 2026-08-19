import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  try {
    const { blobs } = await list({ prefix: '__reservations' });

    if (!blobs.length) {
      return NextResponse.json({ step: 'no_blobs', blobs: [] }, { headers: { 'Cache-Control': 'no-store' } });
    }

    blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    const latest = blobs[0];

    let fetchedData: unknown = null;
    let fetchError: string | null = null;

    try {
      const res = await fetch(latest.url, { cache: 'no-store' });
      fetchedData = await res.json();
    } catch (e) {
      fetchError = String(e);
    }

    return NextResponse.json(
      { step: 'fetched', blobCount: blobs.length, latestUrl: latest.url, latestUploadedAt: latest.uploadedAt, fetchError, fetchedData },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    return NextResponse.json({ step: 'list_error', error: String(e) }, { headers: { 'Cache-Control': 'no-store' }, status: 500 });
  }
}
