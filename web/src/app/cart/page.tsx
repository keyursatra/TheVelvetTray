'use client';
import Link from 'next/link';
import { useCart, useHasMounted } from '@/lib/cart';
import { formatINR } from '@/lib/api';

export default function CartPage() {
  const { lines, update, remove, subtotal } = useCart();
  const mounted = useHasMounted();
  const total = subtotal();

  return (
    <div className="container py-16">
      <div className="eyebrow text-gold-700">Your Tray</div>
      <h1 className="mt-3 font-serif text-display">The basket</h1>

      {!mounted ? (
        <div className="card-tray p-12 mt-10 text-center text-ink-50">
          <div className="eyebrow animate-pulse">Composing</div>
        </div>
      ) : lines.length === 0 ? (
        <div className="card-tray p-12 mt-10 text-center">
          <p className="font-serif text-2xl">Your tray is empty.</p>
          <p className="text-ink-70 mt-3">Begin with the collection.</p>
          <Link href="/hampers" className="btn-primary mt-6 inline-flex">Explore trays</Link>
        </div>
      ) : (
        <div className="mt-10 grid lg:grid-cols-[1.5fr_1fr] gap-10">
          <ul className="divide-y divide-ink/10 border-t border-ink/10">
            {lines.map((l, i) => (
              <li key={`${l.hamperId}-${i}`} className="py-6 flex gap-5 items-start">
                <div className="w-24 h-24 bg-sand flex-shrink-0" aria-hidden />
                <div className="flex-1">
                  <div className="eyebrow text-gold-700">{l.tier}</div>
                  <div className="font-serif text-xl mt-1">{l.name}</div>
                  <div className="mt-2 text-ink-70">{formatINR(l.priceINR)}</div>

                  <div className="mt-4 flex items-center gap-6">
                    <div className="flex items-center border border-ink/30">
                      <button className="px-3 py-2" onClick={() => update(i, { quantity: Math.max(1, l.quantity - 1) })}>−</button>
                      <span className="px-3">{l.quantity}</span>
                      <button className="px-3 py-2" onClick={() => update(i, { quantity: l.quantity + 1 })}>+</button>
                    </div>
                    <button className="text-xs uppercase tracking-widest text-ink-50 hover:text-crimson" onClick={() => remove(i)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="font-serif text-xl">{formatINR(l.priceINR * l.quantity)}</div>
              </li>
            ))}
          </ul>

          <aside className="card-tray p-8 h-fit">
            <div className="eyebrow text-gold-700">Summary</div>
            <dl className="mt-6 space-y-3 text-sm">
              <Row k="Subtotal" v={formatINR(total)} />
              <Row k="GST (18%)" v={formatINR(Math.round(total * 0.18))} />
              <Row k="Shipping" v={total >= 2500 ? 'Complimentary' : formatINR(120)} />
              <div className="pt-4 border-t border-ink/10 flex items-center justify-between">
                <dt className="font-serif text-xl">Total</dt>
                <dd className="font-serif text-xl">
                  {formatINR(Math.round(total * 1.18) + (total >= 2500 ? 0 : 120))}
                </dd>
              </div>
            </dl>
            <Link href="/checkout" className="btn-primary w-full mt-8 justify-center">Proceed to checkout</Link>
            <p className="mt-4 text-xs text-ink-50">Gift notes, delivery dates and addresses are set in checkout.</p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-70">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
