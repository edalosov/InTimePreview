import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { slugToTitle } from '@/lib/utils';

export interface Artwork {
  id: string;
  title: string;
  url: string;
  uploadedAt: string;
}

export async function GET() {
  try {
    const { blobs } = await list();

    const artworks: Artwork[] = blobs
      .map((blob) => {
        const nameWithoutExt = blob.pathname.replace(/\.[^.]+$/, '');
        const separatorIndex = nameWithoutExt.indexOf('__');
        const slug =
          separatorIndex !== -1 ? nameWithoutExt.slice(separatorIndex + 2) : nameWithoutExt;
        const title = slug ? slugToTitle(slug) : 'Untitled';

        return {
          id: blob.url,
          title,
          url: blob.url,
          uploadedAt: blob.uploadedAt.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json(artworks);
  } catch {
    return NextResponse.json({ error: 'Failed to load artworks' }, { status: 500 });
  }
}
