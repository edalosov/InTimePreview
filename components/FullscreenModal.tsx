'use client';

import { useEffect } from 'react';
import type { TokenPrices } from '@/app/api/nft-prices/route';

interface Props {
  artwork: { url: string; title: string } | null;
  prices?: TokenPrices;
  onClose: () => void;
}

export default function FullscreenModal({ artwork, prices, onClose }: Props) {
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

      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-white text-xs tracking-[0.35em] uppercase">
          {artwork.title}
        </p>
        {prices && (prices.offer || prices.listing) && (
          <div className="flex flex-col items-center gap-1">
            {prices.offer && (
              <p className="text-white text-sm font-medium tracking-widest">
                Best offer &nbsp;{prices.offer.eth} {prices.offer.currency}
              </p>
            )}
            {prices.listing && (
              <p className="text-zinc-400 text-xs tracking-wider">
                Listed at &nbsp;{prices.listing.eth} {prices.listing.currency}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
