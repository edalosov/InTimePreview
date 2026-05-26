'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { upload } from '@vercel/blob/client';
import { titleToSlug } from '@/lib/utils';

interface Artwork {
  id: string;
  title: string;
  url: string;
}

interface PendingItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

function filenameToTitle(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const inputClass =
  'w-full bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-600 px-3 py-2 text-xs outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors disabled:opacity-50';

export default function AdminPanel() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const addMoreRef = useRef<HTMLInputElement>(null);

  async function loadArtworks() {
    try {
      const res = await fetch('/api/artworks');
      const data = await res.json();
      if (Array.isArray(data)) setArtworks(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArtworks();
  }, []);

  function addFiles(files: FileList) {
    const newItems: PendingItem[] = Array.from(files).map((file, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      title: filenameToTitle(file.name),
      status: 'pending' as const,
    }));
    setPendingItems((prev) => [...prev, ...newItems]);
  }

  function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  }

  function updateTitle(id: string, title: string) {
    setPendingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title } : item))
    );
  }

  function removePending(id: string) {
    setPendingItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function clearAll() {
    pendingItems.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setPendingItems([]);
  }

  async function uploadAll() {
    const toUpload = pendingItems.filter((i) => i.status === 'pending');
    if (!toUpload.length) return;

    setIsUploading(true);
    setUploadedCount(0);
    let count = 0;

    for (const item of toUpload) {
      setPendingItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading' } : i))
      );

      try {
        const ext = item.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const slug = titleToSlug(item.title.trim() || 'untitled') || 'untitled';
        const filename = `${Date.now()}__${slug}.${ext}`;

        await upload(filename, item.file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });

        setPendingItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'done' } : i))
        );
        count++;
        setUploadedCount(count);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setPendingItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'error', errorMsg: msg } : i))
        );
      }
    }

    setIsUploading(false);
    await loadArtworks();

    // Auto-clear successfully uploaded items after a short delay
    setTimeout(() => {
      setPendingItems((prev) => {
        prev.filter((i) => i.status === 'done').forEach((i) => URL.revokeObjectURL(i.previewUrl));
        return prev.filter((i) => i.status !== 'done');
      });
    }, 1200);
  }

  async function handleDelete(artwork: Artwork) {
    if (!confirm(`Remove "${artwork.title}" from the gallery?`)) return;

    const res = await fetch('/api/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: artwork.url }),
    });

    if (res.ok) {
      setArtworks((prev) => prev.filter((a) => a.id !== artwork.id));
    }
  }

  const pendingCount = pendingItems.filter((i) => i.status === 'pending').length;
  const totalQueued = pendingItems.filter((i) => i.status !== 'error').length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-14">
      {/* Upload section */}
      <section className="space-y-6">
        <h2 className="text-xs tracking-[0.3em] uppercase text-zinc-500">Add Artworks</h2>

        {pendingItems.length === 0 ? (
          <label className="inline-flex items-center gap-2 cursor-pointer border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs tracking-widest uppercase px-6 py-3 hover:border-zinc-600 dark:hover:border-zinc-500 transition-colors">
            + Add Images
            <input type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" />
          </label>
        ) : (
          <div className="space-y-6">
            {/* Preview grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {pendingItems.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />

                    {item.status === 'uploading' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs tracking-widest uppercase">Uploading…</span>
                      </div>
                    )}
                    {item.status === 'done' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-emerald-400 text-xs tracking-widest">✓</span>
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-3">
                        <span className="text-red-400 text-xs text-center leading-relaxed">
                          {item.errorMsg}
                        </span>
                      </div>
                    )}

                    {item.status === 'pending' && !isUploading && (
                      <button
                        onClick={() => removePending(item.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white text-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateTitle(item.id, e.target.value)}
                    disabled={item.status !== 'pending' || isUploading}
                    placeholder="Artwork title"
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-5 flex-wrap">
              <button
                onClick={uploadAll}
                disabled={isUploading || pendingCount === 0}
                className="bg-zinc-900 text-zinc-100 dark:bg-white dark:text-black text-xs tracking-widest uppercase py-3 px-8 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUploading
                  ? `Uploading ${uploadedCount} of ${totalQueued}…`
                  : `Upload ${pendingCount} image${pendingCount === 1 ? '' : 's'}`}
              </button>

              {!isUploading && (
                <>
                  <label className="cursor-pointer text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                    + Add more
                    <input
                      ref={addMoreRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFilesSelected}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={clearAll}
                    className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Gallery section */}
      <section className="space-y-5">
        <h2 className="text-xs tracking-[0.3em] uppercase text-zinc-500">
          Gallery{!loading && ` — ${artworks.length} ${artworks.length === 1 ? 'work' : 'works'}`}
        </h2>

        {loading ? (
          <p className="text-zinc-400 dark:text-zinc-600 text-xs tracking-widest uppercase">Loading…</p>
        ) : artworks.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-700 text-xs">No artworks yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="space-y-2">
                <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900 overflow-hidden group">
                  <img
                    src={artwork.url}
                    alt={artwork.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDelete(artwork)}
                    className="absolute inset-0 bg-black/70 text-red-400 text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-zinc-600 dark:text-zinc-500 text-xs truncate">{artwork.title}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
