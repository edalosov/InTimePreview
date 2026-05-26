import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export interface Artwork {
  id: string;
  title: string;
  url: string;
  uploadedAt: string;
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
