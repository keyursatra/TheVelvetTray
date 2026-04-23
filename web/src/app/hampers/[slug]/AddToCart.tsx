'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import type { Hamper } from '@/lib/types';

export function AddToCart({ hamper, disabled }: { hamper: Hamper; disabled?: boolean }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [qty, setQty] = useState(Math.max(1, hamper.minOrderQty ?? 1));
  const [busy, setBusy] = useState(false);

  const onAdd = () => {
    if (disabled || busy) return;
    setBusy(true);
    add(hamper, qty);
    setTimeout(() => setBusy(false), 300);
  };

  const onBuy = () => {
    if (disabled) return;
    add(hamper, qty);
    router.push('/checkout');
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center border border-ink/30">
        <button
          type="button"
          className="px-4 py-3 hover:bg-ink hover:text-ivory transition-colors"
          onClick={() => setQty((q) => Math.max(hamper.minOrderQty ?? 1, q - 1))}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          type="number"
          min={hamper.minOrderQty ?? 1}
          value={qty}
          onChange={(e) => setQty(Math.max(hamper.minOrderQty ?? 1, Number(e.target.value || 1)))}
          className="w-14 text-center bg-transparent outline-none"
        />
        <button
          type="button"
          className="px-4 py-3 hover:bg-ink hover:text-ivory transition-colors"
          onClick={() => setQty((q) => q + 1)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button className="btn-primary" onClick={onBuy} disabled={disabled}>
        {disabled ? 'Enquire' : 'Buy now'}
      </button>
      <button className="btn-ghost" onClick={onAdd} disabled={disabled || busy}>
        {busy ? 'Added' : 'Add to tray'}
      </button>
    </div>
  );
}
