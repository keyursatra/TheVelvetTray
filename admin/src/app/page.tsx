'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { api, formatINR, formatDate } from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface Dash {
  revenue: { last30: { sum: number; count: number }; last7: { sum: number; count: number } };
  ordersToday: number;
  ordersPending: number;
  enquiriesNew: number;
  outOfStock: number;
  totalHampers: number;
  customers: number;
  lowStock: { name: string; sku: string; stock: number; lowStockThreshold: number }[];
  recentOrders: { _id: string; number: string; status: string; totalINR: number; createdAt: string; type: string }[];
  recentEnquiries: { _id: string; reference: string; contact: { company: string; name: string }; status: string; createdAt: string }[];
}

interface LiveEvent { event: string; at: string; payload: Record<string, unknown> }

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const [live, setLive] = useState<LiveEvent[]>([]);

  const refresh = async () => {
    try { setData(await api<Dash>('/admin/dashboard')); } catch { /* ignore */ }
  };

  useEffect(() => {
    refresh();
    const s = getSocket();
    const handler = (evt: string) => (payload: unknown) => {
      const wrapped = payload as LiveEvent;
      setLive((prev) => [{ event: evt, at: wrapped.at, payload: wrapped.payload as Record<string, unknown> }, ...prev].slice(0, 10));
      refresh();
    };
    s.on('order:new', handler('order:new'));
    s.on('order:update', handler('order:update'));
    s.on('order:status', handler('order:status'));
    s.on('enquiry:new', handler('enquiry:new'));
    s.on('enquiry:update', handler('enquiry:update'));
    s.on('stock:low', handler('stock:low'));
    s.on('stock:out', handler('stock:out'));
    return () => {
      ['order:new', 'order:update', 'order:status', 'enquiry:new', 'enquiry:update', 'stock:low', 'stock:out']
        .forEach((e) => s.off(e));
    };
  }, []);

  return (
    <Shell>
      <div className="p-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow text-gold-700">Overview</div>
            <h1 className="font-serif text-4xl mt-1">Today at the studio.</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Stat label="Revenue · 30d" value={data ? formatINR(data.revenue.last30.sum) : '—'} sub={data ? `${data.revenue.last30.count} orders` : ''} />
          <Stat label="Revenue · 7d" value={data ? formatINR(data.revenue.last7.sum) : '—'} sub={data ? `${data.revenue.last7.count} orders` : ''} />
          <Stat label="Orders pending" value={data?.ordersPending ?? 0} accent={data && data.ordersPending > 0} />
          <Stat label="New enquiries" value={data?.enquiriesNew ?? 0} accent={data && data.enquiriesNew > 0} />
          <Stat label="Orders today" value={data?.ordersToday ?? 0} />
          <Stat label="Hampers live" value={data?.totalHampers ?? 0} />
          <Stat label="Out of stock" value={data?.outOfStock ?? 0} accent={data && data.outOfStock > 0} />
          <Stat label="Customers" value={data?.customers ?? 0} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-10">
          <section className="card p-6 lg:col-span-2">
            <h2 className="font-serif text-xl mb-4">Recent orders</h2>
            <table className="table w-full">
              <thead><tr><th>Order</th><th>Type</th><th>Total</th><th>Status</th><th>When</th></tr></thead>
              <tbody>
                {data?.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td><Link href={`/orders/${o._id}`} className="font-mono hover:text-crimson">{o.number}</Link></td>
                    <td className="capitalize">{o.type}</td>
                    <td>{formatINR(o.totalINR)}</td>
                    <td><StatusPill s={o.status} /></td>
                    <td className="text-ink-50">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card p-6">
            <h2 className="font-serif text-xl mb-4">Live feed</h2>
            {live.length === 0 ? (
              <p className="text-sm text-ink-50">Listening… events will appear here.</p>
            ) : (
              <ul className="space-y-3">
                {live.map((e, i) => (
                  <li key={i} className="text-sm border-l-2 border-crimson pl-3">
                    <div className="eyebrow">{e.event}</div>
                    <div className="mt-1 text-ink-70">
                      {formatEvent(e.event, e.payload)}
                    </div>
                    <div className="text-xs text-ink-50 mt-1">{formatDate(e.at)}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <section className="card p-6">
            <h2 className="font-serif text-xl mb-4">Low stock</h2>
            {data?.lowStock.length ? (
              <ul className="divide-y divide-ink/10">
                {data.lowStock.map((p) => (
                  <li key={p.sku} className="py-2 flex justify-between text-sm">
                    <span>{p.name} <span className="text-ink-50 text-xs ml-2">{p.sku}</span></span>
                    <span className={p.stock === 0 ? 'text-crimson' : 'text-gold-700'}>{p.stock} left</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-ink-50">All products healthy.</p>}
          </section>

          <section className="card p-6">
            <h2 className="font-serif text-xl mb-4">Recent enquiries</h2>
            <ul className="divide-y divide-ink/10">
              {data?.recentEnquiries.map((e) => (
                <li key={e._id} className="py-2 flex justify-between text-sm">
                  <div>
                    <Link href={`/corporate/${e._id}`} className="font-mono hover:text-crimson">{e.reference}</Link>
                    <span className="ml-2 text-ink-70">{e.contact.company}</span>
                  </div>
                  <StatusPill s={e.status} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: boolean | null }) {
  return (
    <div className={`card p-5 ${accent ? 'border-crimson/40' : ''}`}>
      <div className="eyebrow">{label}</div>
      <div className={`mt-2 font-serif text-3xl ${accent ? 'text-crimson' : ''}`}>{value}</div>
      {sub && <div className="text-xs text-ink-50 mt-1">{sub}</div>}
    </div>
  );
}

function StatusPill({ s }: { s: string }) {
  const colour =
    s === 'delivered' ? 'bg-green-100 text-green-800' :
    s === 'dispatched' || s === 'out_for_delivery' || s === 'packed' ? 'bg-blue-100 text-blue-800' :
    s === 'cancelled' || s === 'failed' || s === 'lost' ? 'bg-red-100 text-red-800' :
    s === 'new' || s === 'pending_payment' ? 'bg-gold/20 text-gold-700' :
    'bg-ink/10 text-ink';
  return <span className={`pill ${colour}`}>{s.replace(/_/g, ' ')}</span>;
}

function formatEvent(event: string, p: Record<string, unknown>): string {
  switch (event) {
    case 'order:new':     return `New order ${p.number} · ${p.items ?? ''} items`;
    case 'order:update':  return `Order ${p.number} updated · ${p.status ?? ''}`;
    case 'order:status':  return `Order ${p.number} → ${p.status}`;
    case 'enquiry:new':   return `Enquiry ${p.reference} from ${p.company}`;
    case 'enquiry:update':return `Enquiry ${p.reference} → ${p.status}`;
    case 'stock:low':     return `Low stock: ${p.name} (${p.stock})`;
    case 'stock:out':     return `Out of stock: ${p.name}`;
    default:              return JSON.stringify(p);
  }
}
