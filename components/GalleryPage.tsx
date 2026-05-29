'use client';

import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import ArtworkCard from './ArtworkCard';
import FullscreenModal from './FullscreenModal';
import type { TokenPrices } from '@/app/api/nft-prices/route';

type SortDir = 'asc' | 'desc';

interface Artwork {
  id: string;
  title: string;
  url: string;
  tokenId?: string;
}

const btnClass =
  'border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-500 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all';

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [prices, setPrices] = useState<Record<string, TokenPrices>>({});

  useEffect(() => {
    fetch('/api/artworks')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArtworks(data);
          // Fetch NFT prices in the background after artworks load
          const tokenIds = data
            .map((a: Artwork) => a.tokenId)
            .filter(Boolean);
          if (tokenIds.length > 0) {
            fetch('/api/nft-prices')
              .then((r) => r.json())
              .then((p) => setPrices(p ?? {}))
              .catch(() => {});
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sorted = [...artworks].sort((a, b) =>
    sortDir === 'asc'
      ? a.title.localeCompare(b.title, undefined, { sensitivity: 'base', numeric: true })
      : b.title.localeCompare(a.title, undefined, { sensitivity: 'base', numeric: true })
  );

  return (
    <>
      <header className="px-6 pt-10 pb-8 flex items-center justify-between">
        <ThemeToggle />

        <h1 className="text-sm text-zinc-600 dark:text-zinc-400 tracking-wide">
          <em>In Time</em> by Dalos Dov
        </h1>

        <button
          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          className={btnClass}
        >
          {sortDir === 'asc' ? 'A → Z' : 'Z → A'}
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <span className="text-zinc-400 dark:text-zinc-600 text-xs tracking-[0.3em] uppercase">
            Loading
          </span>
        </div>
      ) : artworks.length === 0 ? (
        <div className="flex items-center justify-center py-32">
          <span className="text-zinc-400 dark:text-zinc-700 text-xs tracking-[0.3em] uppercase">
            No works on display
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px]">
          {sorted.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              prices={artwork.tokenId ? prices[artwork.tokenId] : undefined}
              onClick={() => setSelected(artwork)}
            />
          ))}
        </div>
      )}

      <FullscreenModal
        artwork={selected}
        prices={selected?.tokenId ? prices[selected.tokenId] : undefined}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
