import Link from 'next/link';
import { api } from '@/lib/api';
import type { Occasion } from '@/lib/types';

export const revalidate = 120;

async function fetchOccasions(): Promise<Occasion[]> {
  try { return await api<Occasion[]>('/occasions'); } catch { return []; }
}

export default async function OccasionsPage() {
  const occasions = await fetchOccasions();

  return (
    <div>
      <section className="bg-linen">
        <div className="container py-20">
          <div className="eyebrow text-gold-700">By Occasion</div>
          <h1 className="mt-4 font-serif text-display">For every moment, a tray.</h1>
          <p className="mt-6 max-w-2xl text-ink-70 text-lg leading-relaxed">
            We curate for fourteen occasions — from Diwali to a first day at work. Each one has a
            tone of its own, and hampers that match.
          </p>
        </div>
      </section>

      <section className="container py-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {occasions.map((o) => (
          <Link key={o._id} href={`/occasions/${o.slug}`} className="card-tray p-8 group">
            <div className="eyebrow text-gold-700">{o.tone ?? 'Occasion'}</div>
            <h2 className="mt-3 font-serif text-3xl">{o.name}</h2>
            {o.tagline && <p className="mt-3 text-ink-70 italic">{o.tagline}</p>}
            <div className="mt-6 btn-link text-xs opacity-70 group-hover:opacity-100">Discover trays</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
