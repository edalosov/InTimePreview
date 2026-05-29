import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { slugToTitle } from '@/lib/utils';
import { readMetadata } from '@/lib/metadata';

export interface Artwork {
  id: string;
  title: string;
  url: string;
  pathname: string;
  uploadedAt: string;
  tokenId?: string;
}

export async function GET() {
  try {
    const [{ blobs }, metadata] = await Promise.all([list(), readMetadata()]);

    const artworks: Artwork[] = blobs
      .filter((b) => b.pathname !== '__metadata__.json')
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
          pathname: blob.pathname,
          uploadedAt: blob.uploadedAt.toISOString(),
          tokenId: metadata[blob.pathname] || undefined,
        };
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json(artworks);
  } catch {
    return NextResponse.json({ error: 'Failed to load artworks' }, { status: 500 });
  }
}
