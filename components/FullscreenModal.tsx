'use client';

import { useEffect } from 'react';

interface Props {
  artwork: { url: string; title: string } | null;
  onClose: () => void;
}

export default function FullscreenModal({ artwork, onClose }: Props) {
  useEffect(() => {
    if (!artwork) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handle);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handle);
      document.body.style.overflow = '';
    };
  }, [artwork, onClose]);

  if (!artwork) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/96 px-2"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-6 text-zinc-500 hover:text-white transition-colors text-2xl leading-none"
        aria-label="Close"
      >
        ×
      </button>

      <div
        className="relative flex items-center justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={artwork.url}
          alt={artwork.title}
          className="max-w-full max-h-[92vh] object-contain"
        />
      </div>

      <p className="mt-6 text-zinc-300 text-xs tracking-[0.35em] uppercase">
        {artwork.title}
      </p>
    </div>
  );
}
