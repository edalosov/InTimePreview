import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import AdminPanel from '@/components/AdminPanel';
import ThemeToggle from '@/components/ThemeToggle';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get('admin_session')?.value;

  if (!isAuthenticated(sessionValue)) {
    redirect('/login');
  }

  return (
    <main>
      <header className="px-6 py-6 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
        <p className="text-xs tracking-[0.4em] uppercase text-zinc-500">Admin</p>
        <div className="flex items-center gap-5">
          <ThemeToggle />
          <a
            href="/"
            className="text-xs tracking-wider text-zinc-400 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
          >
            View Gallery →
          </a>
        </div>
      </header>
      <AdminPanel />
    </main>
  );
}
