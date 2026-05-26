import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import AdminPanel from '@/components/AdminPanel';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get('admin_session')?.value;

  if (!isAuthenticated(sessionValue)) {
    redirect('/login');
  }

  return (
    <main>
      <header className="px-6 py-6 border-b border-zinc-900 flex items-center justify-between">
        <p className="text-xs tracking-[0.4em] uppercase text-zinc-500">Admin — Collection</p>
        <a
          href="/"
          className="text-xs tracking-wider text-zinc-700 hover:text-zinc-400 transition-colors"
        >
          View Gallery →
        </a>
      </header>

      <AdminPanel />
    </main>
  );
}
