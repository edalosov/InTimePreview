import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InTime Preview',
  description: 'Art Collection',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-zinc-100 min-h-screen">{children}</body>
    </html>
  );
}
