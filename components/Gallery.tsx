'use client';

import { useState, useEffect } from 'react';
import ArtworkCard from './ArtworkCard';
import FullscreenModal from './FullscreenModal';

interface Artwork {
  id: string;
  title: string;
  url: string;
}

type SortDir = 'asc' | 'desc';

export default function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    fetch('/api/artworks')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setArtworks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-zinc-400 dark:text-zinc-600 text-xs tracking-[0.3em] uppercase">
          Loading
        </span>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-zinc-400 dark:text-zinc-700 text-xs tracking-[0.3em] uppercase">
          No works on display
        </span>
      </div>
    );
  }

  const sorted = [...artworks].sort((a, b) =>
    sortDir === 'asc'
      ? a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
      : b.title.localeCompare(a.title, undefined, { sensitivity: 'base' })
  );

  return (
    <>
      <div className="flex justify-end px-4 pb-3">
        <button
          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          className="border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-500 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
        >
          {sortDir === 'asc' ? 'A → Z' : 'Z → A'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px]">
        {sorted.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            onClick={() => setSelected(artwork)}
          />
        ))}
      </div>

      <FullscreenModal artwork={selected} onClose={() => setSelected(null)} />
    </>
  );
}
