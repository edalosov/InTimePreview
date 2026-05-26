'use client';

import { useState, useEffect } from 'react';
import ArtworkCard from './ArtworkCard';
import FullscreenModal from './FullscreenModal';

interface Artwork {
  id: string;
  title: string;
  url: string;
}

export default function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);

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
        <span className="text-zinc-600 text-xs tracking-[0.3em] uppercase">Loading</span>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-zinc-700 text-xs tracking-[0.3em] uppercase">No works on display</span>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px]">
        {artworks.map((artwork) => (
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
