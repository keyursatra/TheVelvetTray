'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, formatINR } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface OrderRow {
  _id: string;
  number: string;
  status: string;
  totalINR: number;
  createdAt: string;
  type: string;
  lines: { hamperSnapshot: { name: string }; quantity: number }[];
}

export default function MyOrdersPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/account/signin'); return; }
    api<OrderRow[]>('/orders/mine')
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load orders'));
  }, [user, router]);

  return (
    <div className="container py-16">
      <div className="eyebrow text-gold-700">Account</div>
      <h1 className="mt-3 font-serif text-display">Your orders.</h1>
      {user && <p className="mt-3 text-ink-70">{user.email}</p>}

      {error && <p className="mt-8 text-sm text-crimson">{error}</p>}

      {orders?.length === 0 && (
        <div className="card-tray mt-10 p-12 text-center">
          <p className="font-serif text-2xl">No orders yet.</p>
          <Link href="/hampers" className="btn-primary mt-6 inline-flex">Explore the collection</Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <ul className="mt-10 divide-y divide-ink/10 border-t border-ink/10">
          {orders.map((o) => (
            <li key={o._id} className="py-6 flex items-start justify-between gap-6">
              <div>
                <div className="eyebrow text-gold-700">{o.number}</div>
                <div className="mt-2 font-serif text-xl">
                  {o.lines.map((l) => `${l.hamperSnapshot.name} × ${l.quantity}`).join(' · ')}
                </div>
                <div className="mt-1 text-sm text-ink-50">
                  {new Date(o.createdAt).toLocaleDateString()} · {o.status.replace(/_/g, ' ')}
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif text-xl">{formatINR(o.totalINR)}</div>
                <Link href={`/track-order?number=${o.number}`} className="btn-link text-xs mt-3">Track</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
