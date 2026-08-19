'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  artwork: { url: string; title: string };
  onClick: () => void;
}

function isGifUrl(url: string) {
  return url.split('?')[0].toLowerCase().endsWith('.gif');
}

function GifCard({ artwork, onClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [posterReady, setPosterReady] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inViewport, setInViewport] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setInViewport(entry.isIntersecting);
        if (!entry.isIntersecting) setIsHovered(false);
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const showGif = isHovered && inViewport;

  function captureFrame() {
    const img = loaderRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!img || !canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = container.clientWidth || 400;
    const ch = container.clientHeight || 225;
    canvas.width = cw;
    canvas.height = ch;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;

    // object-fit: cover crop
    const scale = Math.max(cw / iw, ch / ih);
    const sw = cw / scale;
    const sh = ch / scale;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;

    try {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      setPosterReady(true);
      img.src = ''; // stop GIF animation; browser serves from cache on next hover
    } catch {
      // CORS blocked — GIF plays normally as fallback
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden cursor-pointer group aspect-video bg-zinc-100 dark:bg-zinc-900"
      onClick={onClick}
      onMouseEnter={() => { if (inViewport) setIsHovered(true); }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hidden loader: lazy-loads GIF and captures first frame to canvas */}
      <img
        ref={loaderRef}
        src={artwork.url}
        alt=""
        aria-hidden
        loading="lazy"
        crossOrigin="anonymous"
        onLoad={captureFrame}
        className={`absolute inset-0 w-full h-full object-cover ${posterReady ? 'hidden' : ''}`}
      />

      {/* Canvas stays in DOM so canvasRef is set before captureFrame runs */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${posterReady && !showGif ? '' : 'hidden'}`}
      />

      {/* Animated GIF: only mounted while hovering in viewport */}
      {showGif && (
        <img
          src={artwork.url}
          alt={artwork.title}
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Play hint on the static poster */}
      {posterReady && !showGif && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm ml-0.5">▶</span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white text-xs tracking-[0.2em] uppercase translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {artwork.title}
        </p>
      </div>
    </div>
  );
}

export default function ArtworkCard({ artwork, onClick }: Props) {
  if (isGifUrl(artwork.url)) {
    return <GifCard artwork={artwork} onClick={onClick} />;
  }

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
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white text-xs tracking-[0.2em] uppercase translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {artwork.title}
        </p>
      </div>
    </div>
  );
}
