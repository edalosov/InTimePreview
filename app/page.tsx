import Gallery from '@/components/Gallery';

export default function Home() {
  return (
    <main>
      <header className="px-6 pt-10 pb-8 text-center">
        <p className="text-xs tracking-[0.4em] uppercase text-zinc-600">Collection</p>
      </header>
      <Gallery />
      <footer className="py-12" />
    </main>
  );
}
