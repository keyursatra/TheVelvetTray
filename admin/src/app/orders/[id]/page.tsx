'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { api, formatINR, formatDate } from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface OrderLine {
  _id: string;
  hamperSnapshot: { name: string; tier: string; priceINR: number };
  quantity: number;
  unitPriceINR: number;
  shippingAddress: { name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string };
  giftNote?: { to?: string; from?: string; message?: string };
  deliveryDate?: string;
  status: string;
  trackingId?: string;
  courier?: string;
  substitutions?: { productName: string; substitutedWith: string; reason?: string }[];
}

interface OrderDetail {
  _id: string;
  number: string;
  type: string;
  guestEmail?: string;
  guestPhone?: string;
  lines: OrderLine[];
  subtotalINR: number;
  taxINR: number;
  shippingINR: number;
  totalINR: number;
  status: string;
  paymentStatus: string;
  paymentProvider?: string;
  paymentMeta?: { razorpayOrderId?: string; razorpayPaymentId?: string };
  statusHistory: { status: string; at: string; note?: string }[];
  corporate?: { poNumber?: string; approvedBy?: string };
  notes?: string;
  createdAt: string;
}

const statusFlow = [
  'pending_payment', 'paid', 'in_production', 'packed', 'dispatched',
  'out_for_delivery', 'delivered',
] as const;

const terminal = ['cancelled', 'refunded', 'failed'] as const;

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setOrder(await api<OrderDetail>(`/admin/orders/${id}`));
    } catch { /* */ }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  useEffect(() => {
    const s = getSocket();
    const reload = (payload: { payload: { id: string } }) => {
      if (payload?.payload?.id === id) load();
    };
    s.on('order:update', reload);
    s.on('order:status', reload);
    return () => {
      s.off('order:update', reload);
      s.off('order:status', reload);
    };
    /* eslint-disable-next-line */
  }, [id]);

  const transition = async (status: string, lineId?: string) => {
    if (!order) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/orders/${order._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note: note || undefined, lineId }),
      });
      setNote('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update');
    } finally {
      setBusy(false);
    }
  };

  if (!order) {
    return <Shell><div className="p-8 text-ink-50 text-sm">Loading order…</div></Shell>;
  }

  const currentIdx = statusFlow.indexOf(order.status as typeof statusFlow[number]);
  const isTerminal = (terminal as readonly string[]).includes(order.status);

  return (
    <Shell>
      <div className="p-8">
        <div className="flex items-start justify-between">
          <div>
            <button onClick={() => router.back()} className="eyebrow text-ink-50 hover:text-ink">← Back</button>
            <div className="eyebrow text-gold-700 mt-3">Order</div>
            <h1 className="font-serif text-4xl mt-1 font-mono">{order.number}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="pill bg-ink/10">{order.status.replace(/_/g, ' ')}</span>
              <span className="text-ink-50">·</span>
              <span className="text-ink-70 capitalize">{order.type}</span>
              <span className="text-ink-50">·</span>
              <span className="text-ink-50">{formatDate(order.createdAt)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="eyebrow">Total</div>
            <div className="font-serif text-4xl">{formatINR(order.totalINR)}</div>
            <div className={`mt-2 pill ${order.paymentStatus === 'captured' ? 'bg-green-100 text-green-800' : 'bg-gold/20 text-gold-700'}`}>
              Payment · {order.paymentStatus}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-6 mt-10">
          <div className="space-y-6">
            <section className="card p-6">
              <h2 className="font-serif text-xl mb-4">Lines ({order.lines.length})</h2>
              <ul className="divide-y divide-ink/10">
                {order.lines.map((l) => (
                  <li key={l._id} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="eyebrow text-gold-700">{l.hamperSnapshot.tier}</div>
                        <div className="font-serif text-lg mt-1">{l.hamperSnapshot.name}</div>
                        <div className="text-sm text-ink-70 mt-1">
                          × {l.quantity} · {formatINR(l.unitPriceINR)} each
                        </div>
                        <div className="text-xs text-ink-50 mt-2">
                          Ship to: {l.shippingAddress.name}, {l.shippingAddress.line1}, {l.shippingAddress.city} {l.shippingAddress.pincode}
                        </div>
                        {l.deliveryDate && (
                          <div className="text-xs text-ink-50 mt-1">
                            Delivery date: {new Date(l.deliveryDate).toLocaleDateString()}
                          </div>
                        )}
                        {l.giftNote?.message && (
                          <div className="mt-2 text-xs italic text-ink-70 bg-paper p-2 rounded-sm">
                            “{l.giftNote.message}”
                          </div>
                        )}
                        {l.substitutions && l.substitutions.length > 0 && (
                          <div className="mt-2 text-xs text-crimson">
                            Substituted: {l.substitutions.map((s) => `${s.productName} → ${s.substitutedWith}`).join(', ')}
                          </div>
                        )}
                        {l.trackingId && (
                          <div className="mt-2 text-xs">
                            <span className="text-ink-50">Tracking:</span>{' '}
                            <span className="font-mono">{l.courier} · {l.trackingId}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-serif">{formatINR(l.unitPriceINR * l.quantity)}</div>
                        <div className="mt-2 pill bg-ink/10 text-[10px]">{l.status.replace(/_/g, ' ')}</div>
                        <div className="mt-3 flex flex-col gap-1">
                          {['packed', 'dispatched', 'delivered'].map((s) => (
                            <button
                              key={s}
                              className="text-[10px] uppercase tracking-wider border border-ink/20 px-2 py-1 hover:border-ink"
                              onClick={() => transition(s, l._id)}
                              disabled={busy || l.status === s}
                            >
                              → {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card p-6">
              <h2 className="font-serif text-xl mb-4">Summary</h2>
              <dl className="space-y-2 text-sm">
                <Row k="Subtotal" v={formatINR(order.subtotalINR)} />
                <Row k="GST" v={formatINR(order.taxINR)} />
                <Row k="Shipping" v={order.shippingINR === 0 ? 'Complimentary' : formatINR(order.shippingINR)} />
                <div className="pt-3 border-t border-ink/10 flex justify-between">
                  <dt className="font-serif text-lg">Total</dt>
                  <dd className="font-serif text-lg">{formatINR(order.totalINR)}</dd>
                </div>
              </dl>
              {order.paymentMeta?.razorpayPaymentId && (
                <div className="mt-4 pt-4 border-t border-ink/10 text-xs space-y-1">
                  <div><span className="text-ink-50">Razorpay order:</span> <span className="font-mono">{order.paymentMeta.razorpayOrderId}</span></div>
                  <div><span className="text-ink-50">Razorpay payment:</span> <span className="font-mono">{order.paymentMeta.razorpayPaymentId}</span></div>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="card p-6">
              <h2 className="font-serif text-lg mb-4">Advance status</h2>
              {isTerminal ? (
                <p className="text-sm text-ink-50">Order is in a terminal state.</p>
              ) : (
                <>
                  <textarea
                    className="input text-sm"
                    rows={2}
                    placeholder="Note (optional, visible in history)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {statusFlow.slice(Math.max(0, currentIdx), statusFlow.length).map((s) => (
                      <button
                        key={s}
                        onClick={() => transition(s)}
                        disabled={busy || s === order.status}
                        className="btn-ghost text-xs"
                      >
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-ink/10 pt-3 grid grid-cols-2 gap-2">
                    <button onClick={() => transition('cancelled')} disabled={busy} className="btn-ghost text-xs text-crimson border-crimson/40">
                      Cancel
                    </button>
                    <button onClick={() => transition('refunded')} disabled={busy} className="btn-ghost text-xs text-crimson border-crimson/40">
                      Refund
                    </button>
                  </div>
                  {error && <p className="text-xs text-crimson mt-3">{error}</p>}
                </>
              )}
            </section>

            <section className="card p-6">
              <h2 className="font-serif text-lg mb-4">Contact</h2>
              <div className="text-sm space-y-1">
                <div>{order.guestEmail ?? '—'}</div>
                <div>{order.guestPhone ?? '—'}</div>
              </div>
              {order.corporate?.poNumber && (
                <div className="mt-4 pt-4 border-t border-ink/10 text-xs">
                  <div className="eyebrow">PO</div>
                  <div className="mt-1 font-mono">{order.corporate.poNumber}</div>
                  {order.corporate.approvedBy && (
                    <div className="text-ink-50 mt-1">Approved by {order.corporate.approvedBy}</div>
                  )}
                </div>
              )}
            </section>

            <section className="card p-6">
              <h2 className="font-serif text-lg mb-4">History</h2>
              <ol className="space-y-3">
                {order.statusHistory.map((h, i) => (
                  <li key={i} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
                      <span className="capitalize">{h.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="text-xs text-ink-50 ml-3.5 mt-0.5">{formatDate(h.at)}</div>
                    {h.note && <div className="text-xs text-ink-70 ml-3.5 mt-1 italic">{h.note}</div>}
                  </li>
                ))}
              </ol>
            </section>

            <Link href="/orders" className="btn-ghost w-full justify-center">← All orders</Link>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><dt className="text-ink-70">{k}</dt><dd>{v}</dd></div>;
}
