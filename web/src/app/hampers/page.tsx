import { api } from '@/lib/api';
import type { Hamper } from '@/lib/types';
import { HamperCard } from '@/components/hampers/HamperCard';

export const revalidate = 60;

interface PageProps {
  searchParams: { occasion?: string; tier?: string; sort?: string; recipient?: string };
}

async function fetchHampers(params: URLSearchParams): Promise<Hamper[]> {
  try {
    return await api<Hamper[]>(`/hampers?${params.toString()}`, { cache: 'no-store' });
  } catch {
    return [];
  }
}

export default async function HampersPage({ searchParams }: PageProps) {
  const qs = new URLSearchParams();
  if (searchParams.occasion) qs.set('occasion', searchParams.occasion);
  if (searchParams.tier) qs.set('tier', searchParams.tier);
  if (searchParams.sort) qs.set('sort', searchParams.sort);
  if (searchParams.recipient) qs.set('recipient', searchParams.recipient);
  qs.set('limit', '24');

  const hampers = await fetchHampers(qs);

  return (
    <div>
      <section className="bg-linen">
        <div className="container py-20">
          <div className="eyebrow text-gold-700">The Collection</div>
          <h1 className="mt-4 font-serif text-display max-w-3xl">Every tray is a composition.</h1>
          <p className="mt-6 max-w-2xl text-ink-70 text-lg leading-relaxed">
            Browse our signature hampers — from the quietly elegant Essential Tray to the
            deeply considered Atelier Noir. Each is composed from regional makers, small-batch.
          </p>
        </div>
      </section>

      <section className="container py-14">
        <Filters current={searchParams} />
        {hampers.length === 0 ? (
          <div className="card-tray p-12 text-center mt-10">
            <div className="eyebrow text-gold-700">Collection in composition</div>
            <h3 className="mt-4 font-serif text-2xl">No hampers match these filters yet.</h3>
            <p className="mt-3 text-ink-70">Try clearing filters or check back after seeding the database.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {hampers.map((h) => (
              <HamperCard key={h._id} h={h} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Filters({ current }: { current: PageProps['searchParams'] }) {
  const tiers = [
    { v: '', label: 'All tiers' },
    { v: 'signature', label: 'Signature' },
    { v: 'heritage', label: 'Heritage' },
    { v: 'atelier', label: 'Atelier' },
    { v: 'noir', label: 'Noir' },
  ];
  return (
    <div className="flex flex-wrap gap-3 items-center pt-2">
      <span className="eyebrow text-ink-50 mr-2">Filter</span>
      {tiers.map((t) => {
        const active = (current.tier ?? '') === t.v;
        const href = t.v ? `/hampers?tier=${t.v}` : '/hampers';
        return (
          <a
            key={t.v || 'all'}
            href={href}
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
              active ? 'bg-ink text-ivory border-ink' : 'border-ink/30 hover:border-ink'
            }`}
          >
            {t.label}
          </a>
        );
      })}
    </div>
  );
}
