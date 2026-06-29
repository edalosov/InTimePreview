'use client';

import { useEffect } from 'react';

interface Props {
  artwork: { url: string; title: string } | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function FullscreenModal({ artwork, onClose, onPrev, onNext }: Props) {
  const isOpen = artwork !== null;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!artwork) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-2"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-6 text-zinc-500 hover:text-white transition-colors text-2xl leading-none"
        aria-label="Close"
      >
        ×
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-1 sm:left-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-4xl leading-none px-3 py-6"
        aria-label="Previous artwork"
      >
        ‹
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-1 sm:right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-4xl leading-none px-3 py-6"
        aria-label="Next artwork"
      >
        ›
      </button>

      <div
        className="relative flex items-center justify-center w-full max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={artwork.url}
          alt={artwork.title}
          className="max-w-full max-h-[85vh] object-contain"
        />
      </div>

      <p className="mt-6 text-white text-xs tracking-[0.35em] uppercase">
        {artwork.title}
      </p>
    </div>
  );
}
