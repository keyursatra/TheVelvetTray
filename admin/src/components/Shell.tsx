'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, getToken, setToken } from '@/lib/api';
import { getSocket, disconnectSocket } from '@/lib/socket';

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/orders', label: 'Orders' },
  { href: '/hampers', label: 'Hampers' },
  { href: '/occasions', label: 'Occasions' },
  { href: '/studio', label: 'Studio' },
  { href: '/corporate', label: 'Enquiries' },
  { href: '/users', label: 'Users' },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    let cancelled = false;
    api<{ name: string; email: string; role: string }>('/auth/me')
      .then((u) => {
        if (cancelled) return;
        if (u.role !== 'admin' && u.role !== 'superadmin') {
          setToken(null);
          router.push('/login');
          return;
        }
        setUser(u);
      })
      .catch(() => {
        setToken(null);
        router.push('/login');
      });

    const s = getSocket();
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', () => setConnected(false));

    return () => { cancelled = true; };
  }, [router]);

  const logout = () => {
    setToken(null);
    disconnectSocket();
    router.push('/login');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-ink-50 text-sm">Loading…</div>;
  }

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-ink text-ivory flex flex-col">
        <div className="px-6 py-6 border-b border-ivory/10">
          <div className="font-serif text-xl">The Velvet Tray</div>
          <div className="eyebrow text-ivory/50 mt-1">Admin · v1</div>
        </div>
        <nav className="flex-1 py-4">
          {nav.map((n) => {
            const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`block px-6 py-2.5 text-sm transition-colors ${
                  active ? 'bg-crimson text-ivory' : 'text-ivory/70 hover:text-ivory hover:bg-ivory/5'
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-ivory/10 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-ivory/70">{connected ? 'Realtime live' : 'Connecting…'}</span>
          </div>
          <div className="mt-3 text-ivory/80">{user.name}</div>
          <div className="text-ivory/50">{user.email}</div>
          <button onClick={logout} className="mt-3 text-ivory/60 hover:text-ivory text-xs underline">
            Sign out
          </button>
        </div>
      </aside>
      <main className="overflow-auto">{children}</main>
    </div>
  );
}
