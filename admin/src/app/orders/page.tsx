'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { api, formatINR, formatDate } from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface Order { _id: string; number: string; status: string; totalINR: number; type: string; createdAt: string }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const load = async () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    try { setOrders(await api<Order[]>(`/admin/orders?${params.toString()}`)); } catch { /* ignore */ }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status]);

  useEffect(() => {
    const s = getSocket();
    const reload = () => load();
    s.on('order:new', reload);
    s.on('order:update', reload);
    s.on('order:status', reload);
    return () => {
      s.off('order:new', reload);
      s.off('order:update', reload);
      s.off('order:status', reload);
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const statuses = ['', 'pending_payment', 'paid', 'in_production', 'packed', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <Shell>
      <div className="p-8">
        <div className="eyebrow text-gold-700">Operations</div>
        <h1 className="font-serif text-4xl mt-1">Orders</h1>

        <div className="mt-6 flex flex-wrap gap-2 items-center">
          {statuses.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider border rounded-sm ${status === s ? 'bg-ink text-ivory border-ink' : 'border-ink/20 hover:border-ink'}`}
            >
              {s ? s.replace(/_/g, ' ') : 'All'}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <input className="input w-56" placeholder="Search order #" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
            <button onClick={load} className="btn-ghost">Search</button>
          </div>
        </div>

        <div className="card mt-6 overflow-hidden">
          <table className="table w-full">
            <thead><tr><th>Order</th><th>Type</th><th>Total</th><th>Status</th><th>Placed</th><th></th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td><Link href={`/orders/${o._id}`} className="font-mono hover:text-crimson">{o.number}</Link></td>
                  <td className="capitalize">{o.type}</td>
                  <td>{formatINR(o.totalINR)}</td>
                  <td><span className="pill bg-ink/10">{o.status.replace(/_/g, ' ')}</span></td>
                  <td className="text-ink-50">{formatDate(o.createdAt)}</td>
                  <td className="text-right"><Link href={`/orders/${o._id}`} className="text-xs text-crimson">Open →</Link></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="text-center text-ink-50 py-10">No orders match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
