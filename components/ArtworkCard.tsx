'use client';

interface Props {
  artwork: { url: string; title: string };
  onClick: () => void;
}

export default function ArtworkCard({ artwork, onClick }: Props) {
  return (
    <div
      className="relative overflow-hidden cursor-pointer group aspect-video bg-zinc-900"
      onClick={onClick}
    >
      <img
        src={artwork.url}
        alt={artwork.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white text-xs tracking-[0.2em] uppercase font-light translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {artwork.title}
        </p>
      </div>
    </div>
  );
}
