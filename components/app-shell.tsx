import Link from 'next/link';
import { ReactNode } from 'react';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/calendar', label: 'Calendrier' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/recurring', label: 'Récurrents' },
  { href: '/reports', label: 'Rapports' },
  { href: '/settings', label: 'Settings' }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 p-4">
          <h1 className="text-lg font-semibold">Finance Foyer</h1>
          <nav className="flex flex-wrap gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1 text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
