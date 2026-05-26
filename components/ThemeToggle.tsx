'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="text-[10px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
