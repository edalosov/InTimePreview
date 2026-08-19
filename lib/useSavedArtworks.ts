'use client';

import { useState, useEffect } from 'react';

const KEY = 'in-time-saved';

export function useSavedArtworks() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(stored)) setSavedIds(new Set(stored));
    } catch {}
  }, []);

  function toggle(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }

  return { savedIds, toggle };
}
