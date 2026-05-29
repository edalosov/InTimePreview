import { put, list } from '@vercel/blob';

// pathname → tokenId, e.g. { "1716900000000__artwork.jpg": "42" }
export type MetadataStore = Record<string, string>;

const METADATA_PATH = '__metadata__.json';

export async function readMetadata(): Promise<MetadataStore> {
  try {
    const { blobs } = await list({ prefix: '__metadata__' });
    const blob = blobs.find((b) => b.pathname === METADATA_PATH);
    if (!blob) return {};
    const res = await fetch(blob.downloadUrl, { cache: 'no-store' });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export async function writeMetadata(data: MetadataStore): Promise<void> {
  await put(METADATA_PATH, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}
