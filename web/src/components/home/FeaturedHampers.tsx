import Link from 'next/link';
import { api } from '@/lib/api';
import type { Hamper } from '@/lib/types';
import { HamperCard } from '@/components/hampers/HamperCard';

async function fetchFeatured(): Promise<Hamper[]> {
  try {
    return await api<Hamper[]>('/hampers?featured=true&limit=4', { cache: 'no-store' });
  } catch {
    return [];
  }
}

export async function FeaturedHampers() {
  const hampers = await fetchFeatured();

  return (
    <section className="py-24 border-t border-ink/10">
      <div className="container">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="eyebrow text-gold-700">The Collection</div>
            <h2 className="mt-3 font-serif text-hero">Considered, not catalogued.</h2>
          </div>
          <Link href="/hampers" className="btn-link hidden md:inline">See all trays</Link>
        </div>

        {hampers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {hampers.map((h) => (
              <HamperCard key={h._id} h={h} />
            ))}
          </div>
        )}

        <div className="mt-10 md:hidden">
          <Link href="/hampers" className="btn-link">See all trays</Link>
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="card-tray p-12 text-center">
      <div className="eyebrow text-gold-700">Almost ready</div>
      <h3 className="mt-4 font-serif text-2xl">Our first collection is being composed.</h3>
      <p className="mt-3 text-ink-70 max-w-xl mx-auto">
        Seed the database <code className="font-sans text-xs bg-sand px-1.5 py-0.5">npm run seed</code> in
        the API workspace to populate featured hampers.
      </p>
    </div>
  );
}
