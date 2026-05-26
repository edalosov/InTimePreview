'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-500 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
