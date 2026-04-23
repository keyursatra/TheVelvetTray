'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Hamper } from './types';

export interface CartLine {
  hamperId: string;
  slug: string;
  name: string;
  tier: string;
  priceINR: number;
  heroImage?: string;
  quantity: number;
  customization?: { key: string; value: string }[];
  giftNote?: { to?: string; from?: string; message?: string };
  addressId?: string;
}

interface CartState {
  lines: CartLine[];
  add: (hamper: Hamper, quantity?: number) => void;
  update: (index: number, patch: Partial<CartLine>) => void;
  remove: (index: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (h, quantity = 1) => {
        const existing = get().lines.findIndex((l) => l.hamperId === h._id);
        if (existing !== -1) {
          const lines = [...get().lines];
          lines[existing] = { ...lines[existing], quantity: lines[existing].quantity + quantity };
          set({ lines });
        } else {
          set({
            lines: [
              ...get().lines,
              {
                hamperId: h._id,
                slug: h.slug,
                name: h.name,
                tier: h.tier,
                priceINR: h.priceINR,
                heroImage: h.heroImage ?? h.images?.[0]?.url,
                quantity,
              },
            ],
          });
        }
      },
      update: (i, patch) => {
        const lines = [...get().lines];
        if (!lines[i]) return;
        lines[i] = { ...lines[i], ...patch };
        set({ lines });
      },
      remove: (i) => set({ lines: get().lines.filter((_, idx) => idx !== i) }),
      clear: () => set({ lines: [] }),
      subtotal: () => get().lines.reduce((s, l) => s + l.priceINR * l.quantity, 0),
      count: () => get().lines.reduce((s, l) => s + l.quantity, 0),
    }),
    { name: 'vt_cart' },
  ),
);
