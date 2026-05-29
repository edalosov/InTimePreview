'use client';

import type { TokenPrices } from '@/app/api/nft-prices/route';

interface Props {
  artwork: { url: string; title: string };
  prices?: TokenPrices;
  onClick: () => void;
}

export default function ArtworkCard({ artwork, prices, onClick }: Props) {
  return (
    <div
      className="relative overflow-hidden cursor-pointer group aspect-video bg-zinc-100 dark:bg-zinc-900"
      onClick={onClick}
    >
      <img
        src={artwork.url}
        alt={artwork.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
        <p className="text-white text-xs tracking-[0.2em] uppercase translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {artwork.title}
        </p>
        {prices && (prices.offer || prices.listing) && (
          <div className="flex flex-col items-end gap-0.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 shrink-0 ml-3">
            {prices.offer && (
              <span className="text-white text-xs font-medium tracking-wide">
                {prices.offer.eth} {prices.offer.currency}
              </span>
            )}
            {prices.listing && (
              <span className="text-zinc-300 text-[10px] tracking-wide">
                {prices.listing.eth} {prices.listing.currency}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
