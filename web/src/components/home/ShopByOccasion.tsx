import Link from 'next/link';
import { api } from '@/lib/api';
import type { Occasion } from '@/lib/types';

async function fetchOccasions(): Promise<Occasion[]> {
  try {
    return await api<Occasion[]>('/occasions', { cache: 'no-store' });
  } catch {
    return [];
  }
}

export async function ShopByOccasion() {
  const occasions = await fetchOccasions();
  const primary = occasions.slice(0, 6);

  return (
    <section className="py-24 bg-linen">
      <div className="container">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="eyebrow text-gold-700">By Occasion</div>
            <h2 className="mt-3 font-serif text-hero">For every moment, a tray.</h2>
          </div>
          <Link href="/occasions" className="btn-link hidden md:inline">All occasions</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {primary.map((o) => (
            <Link
              key={o._id}
              href={`/occasions/${o.slug}`}
              className="group relative aspect-[4/3] card-tray overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sand via-gold-50 to-linen" />
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="eyebrow text-gold-700">{o.tone ?? 'Occasion'}</div>
                <div>
                  <h3 className="font-serif text-3xl">{o.name}</h3>
                  {o.tagline && (
                    <p className="mt-2 text-ink-70 italic">{o.tagline}</p>
                  )}
                  <span className="mt-4 inline-block btn-link text-xs opacity-70 group-hover:opacity-100">
                    Discover
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
