'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Incorrect password.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-5">
        <p className="text-xs tracking-[0.4em] uppercase text-zinc-600 text-center mb-8">
          Admin Access
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          required
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 px-4 py-3 text-sm outline-none focus:border-zinc-600 transition-colors"
        />

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black text-xs tracking-widest uppercase py-3 hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
