'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, formatINR } from '@/lib/api';

interface TrackedOrder {
  _id: string;
  number: string;
  status: string;
  totalINR: number;
  createdAt: string;
  statusHistory: { status: string; at: string; note?: string }[];
  lines: { hamperSnapshot: { name: string }; quantity: number; status: string; trackingId?: string; courier?: string }[];
}

export default function TrackOrderPage() {
  const params = useSearchParams();
  const [number, setNumber] = useState(params.get('number') ?? '');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const lookup = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await api<TrackedOrder>(`/orders/${encodeURIComponent(number)}${email ? `?email=${encodeURIComponent(email)}` : ''}`);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to find order');
      setOrder(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-16">
      <div className="eyebrow text-gold-700">Tracking</div>
      <h1 className="mt-3 font-serif text-display">Follow your tray.</h1>

      <div className="mt-10 grid lg:grid-cols-[1fr_2fr] gap-10">
        <section className="card-tray p-8 h-fit">
          <label className="block">
            <span className="eyebrow text-ink-50 block mb-2">Order number</span>
            <input className="input" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="VT-20260423-1234" />
          </label>
          <label className="block mt-5">
            <span className="eyebrow text-ink-50 block mb-2">Email (for guest orders)</span>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <button className="btn-primary mt-6 w-full justify-center" onClick={lookup} disabled={busy || !number}>
            {busy ? 'Searching…' : 'Track order'}
          </button>
          {error && <p className="mt-4 text-sm text-crimson">{error}</p>}
        </section>

        <section>
          {order ? (
            <div className="card-tray p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="eyebrow text-gold-700">{order.number}</div>
                  <h2 className="mt-2 font-serif text-3xl">{statusLabel(order.status)}</h2>
                </div>
                <div className="font-serif text-2xl">{formatINR(order.totalINR)}</div>
              </div>

              <ol className="mt-8 space-y-5">
                {order.statusHistory.map((s, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-crimson flex-shrink-0" />
                    <div>
                      <div className="font-serif">{statusLabel(s.status)}</div>
                      <div className="text-xs text-ink-50">{new Date(s.at).toLocaleString()}</div>
                      {s.note && <div className="text-sm text-ink-70 mt-1">{s.note}</div>}
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8 border-t border-ink/10 pt-6">
                <div className="eyebrow text-gold-700 mb-3">Trays in this order</div>
                <ul className="space-y-3">
                  {order.lines.map((l, i) => (
                    <li key={i} className="flex items-start justify-between">
                      <div>
                        <div className="font-serif text-lg">{l.hamperSnapshot.name}</div>
                        <div className="text-sm text-ink-50">× {l.quantity} · {statusLabel(l.status)}</div>
                      </div>
                      {l.trackingId && (
                        <div className="text-xs text-ink-70">{l.courier} · {l.trackingId}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="card-tray p-12 text-center">
              <p className="text-ink-70">Enter your order number to see its progress.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    pending_payment: 'Awaiting payment',
    paid: 'Payment received',
    in_production: 'Being composed',
    packed: 'Packed',
    dispatched: 'Dispatched',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    partially_delivered: 'Partially delivered',
    failed: 'Delivery failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return map[s] ?? s;
}
