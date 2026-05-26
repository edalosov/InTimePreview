'use client';

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';

interface Artwork {
  id: string;
  title: string;
  url: string;
}

export default function AdminPanel() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadArtworks() {
    const res = await fetch('/api/artworks');
    const data = await res.json();
    if (Array.isArray(data)) setArtworks(data);
    setLoading(false);
  }

  useEffect(() => {
    loadArtworks();
  }, []);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();

    if (res.ok) {
      setTitle('');
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      setSuccess('Artwork uploaded successfully.');
      await loadArtworks();
    } else if (res.status === 401) {
      setError('Session expired — please log in again.');
    } else {
      setError(data?.error || 'Upload failed. Please try again.');
    }

    setUploading(false);
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-14">
      {/* Upload */}
      <section className="space-y-5">
        <h2 className="text-xs tracking-[0.3em] uppercase text-zinc-500">Add Artwork</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Artwork title"
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 px-4 py-3 text-sm outline-none focus:border-zinc-600 transition-colors"
                required
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:tracking-widest file:uppercase file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:cursor-pointer cursor-pointer"
                required
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              {success && <p className="text-emerald-500 text-xs">{success}</p>}
              <button
                type="submit"
                disabled={uploading || !file || !title.trim()}
                className="bg-white text-black text-xs tracking-widest uppercase py-3 px-8 hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </div>

            {preview && (
              <div className="w-44 h-32 bg-zinc-900 overflow-hidden flex-shrink-0 border border-zinc-800">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </form>
      </section>

      {/* Current gallery */}
      <section className="space-y-5">
        <h2 className="text-xs tracking-[0.3em] uppercase text-zinc-500">
          Gallery{!loading && ` — ${artworks.length} ${artworks.length === 1 ? 'work' : 'works'}`}
        </h2>

        {loading ? (
          <p className="text-zinc-600 text-xs tracking-widest uppercase">Loading…</p>
        ) : artworks.length === 0 ? (
          <p className="text-zinc-700 text-xs">No artworks yet. Upload your first piece above.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="space-y-2">
                <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden group">
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
                <p className="text-zinc-500 text-xs truncate">{artwork.title}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
