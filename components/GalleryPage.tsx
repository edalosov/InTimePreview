'use client';

import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import ArtworkCard from './ArtworkCard';
import FullscreenModal from './FullscreenModal';

type SortDir = 'asc' | 'desc';

interface Artwork {
  id: string;
  title: string;
  url: string;
}

const btnClass =
  'border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-500 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all';

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
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

  const sorted = [...artworks].sort((a, b) =>
    sortDir === 'asc'
      ? a.title.localeCompare(b.title, undefined, { sensitivity: 'base', numeric: true })
      : b.title.localeCompare(a.title, undefined, { sensitivity: 'base', numeric: true })
  );

  function openAt(index: number) {
    setHistory([]);
    setSelectedIndex(index);
  }

  function showRandom() {
    if (sorted.length === 0) return;
    if (selectedIndex === null) setHistory([]);
    else setHistory((h) => [...h, selectedIndex]);
    setSelectedIndex(Math.floor(Math.random() * sorted.length));
  }

  function showNext() {
    if (selectedIndex === null) return;
    setHistory((h) => [...h, selectedIndex]);
    setSelectedIndex((selectedIndex + 1) % sorted.length);
  }

  function showPrev() {
    if (selectedIndex === null) return;
    setHistory((h) => [...h, selectedIndex]);
    setSelectedIndex((selectedIndex - 1 + sorted.length) % sorted.length);
  }

  function showBack() {
    if (history.length === 0) return;
    setSelectedIndex(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  }

  function closeModal() {
    setSelectedIndex(null);
    setHistory([]);
  }

  return (
    <>
      <header className="px-6 pt-10 pb-8 flex items-center justify-between">
        <ThemeToggle />

        <h1 className="text-sm text-zinc-600 dark:text-zinc-400 tracking-wide">
          <em>In Time</em> by Dalos Dov
        </h1>

        <div className="flex items-center gap-2">
          <button onClick={showRandom} className={btnClass}>
            Random
          </button>
          <button
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className={btnClass}
          >
            {sortDir === 'asc' ? 'A → Z' : 'Z → A'}
          </button>
        </div>
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
          {sorted.map((artwork, index) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onClick={() => openAt(index)}
            />
          ))}
        </div>
      )}

      <FullscreenModal
        artwork={selectedIndex !== null ? sorted[selectedIndex] : null}
        onClose={closeModal}
        onPrev={showPrev}
        onNext={showNext}
        onRandom={showRandom}
        onBack={showBack}
        canGoBack={history.length > 0}
      />
    </>
  );
}
