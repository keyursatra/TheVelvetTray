import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import type { Hamper, Occasion } from '@/lib/types';
import { HamperCard } from '@/components/hampers/HamperCard';

interface PageProps { params: { slug: string } }

async function fetchOccasion(slug: string) {
  try { return await api<{ occasion: Occasion; hampers: Hamper[] }>(`/occasions/${slug}`); }
  catch { return null; }
}

export async function generateMetadata({ params }: PageProps) {
  const r = await fetchOccasion(params.slug);
  return { title: r?.occasion.name ?? 'Occasion', description: r?.occasion.tagline };
}

export default async function OccasionPage({ params }: PageProps) {
  const r = await fetchOccasion(params.slug);
  if (!r) notFound();
  const { occasion, hampers } = r;

  return (
    <div>
      <section className="bg-linen">
        <div className="container py-24">
          <div className="eyebrow text-gold-700">{occasion.tone ?? 'Occasion'}</div>
          <h1 className="mt-4 font-serif text-display max-w-3xl">{occasion.name}</h1>
          {occasion.tagline && (
            <p className="mt-6 max-w-2xl text-xl text-ink-70 font-serif italic">{occasion.tagline}</p>
          )}
        </div>
      </section>

      <section className="container py-16">
        {hampers.length === 0 ? (
          <div className="card-tray p-12 text-center">
            <div className="eyebrow text-gold-700">Coming together</div>
            <p className="mt-3 text-ink-70">This season's hampers are still being composed.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hampers.map((h) => <HamperCard key={h._id} h={h} />)}
          </div>
        )}
      </section>
    </div>
  );
}
