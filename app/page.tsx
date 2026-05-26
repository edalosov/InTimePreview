import Gallery from '@/components/Gallery';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <main>
      <header className="px-6 pt-10 pb-8 flex items-center justify-between">
        <div className="w-20" />
        <h1 className="text-sm text-zinc-600 dark:text-zinc-400 tracking-wide">
          <em>In Time</em> by Dalos Dov
        </h1>
        <div className="w-20 flex justify-end">
          <ThemeToggle />
        </div>
      </header>
      <Gallery />
      <footer className="py-12" />
    </main>
  );
}
