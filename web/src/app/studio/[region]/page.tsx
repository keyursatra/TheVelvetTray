import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Product, Region } from '@/lib/types';

interface PageProps { params: { region: string } }

async function fetchRegion(slug: string) {
  try { return await api<{ region: Region; products: Product[] }>(`/regions/${slug}`); }
  catch { return null; }
}

export async function generateMetadata({ params }: PageProps) {
  const r = await fetchRegion(params.region);
  return { title: r?.region.name ?? 'Region', description: r?.region.shortIntro };
}

export default async function RegionPage({ params }: PageProps) {
  const data = await fetchRegion(params.region);
  if (!data) notFound();
  const { region, products } = data;

  return (
    <article className="pb-24">
      <section className="bg-ink text-ivory">
        <div className="container py-24">
          <nav className="eyebrow text-gold/80 mb-6">
            <Link href="/studio">The Studio</Link>
          </nav>
          <div className="eyebrow text-gold">{region.state}</div>
          <h1 className="mt-4 font-serif text-display">{region.name}</h1>
          <p className="mt-3 italic text-ivory/70">{region.craft}</p>
          {region.mapCoords && (
            <div className="mt-6 eyebrow text-ivory/50">
              {region.mapCoords.lat.toFixed(3)}°N · {region.mapCoords.lng.toFixed(3)}°E
            </div>
          )}
        </div>
      </section>

      <section className="container py-16 grid lg:grid-cols-[1fr_1.6fr] gap-16">
        <div>
          <div className="eyebrow text-gold-700">Provenance</div>
          <h2 className="mt-3 font-serif text-3xl leading-tight">Where the tray begins.</h2>
        </div>
        <div className="prose max-w-none">
          <p className="text-xl font-serif italic text-ink-70">{region.shortIntro}</p>
          <p className="mt-6 text-lg leading-relaxed text-ink">{region.longStory}</p>
        </div>
      </section>

      {products.length > 0 && (
        <section className="container mt-16">
          <div className="eyebrow text-gold-700 mb-8">Objects from {region.name}</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p._id} className="card-tray p-6">
                <div className="eyebrow text-ink-50">{p.category}</div>
                <div className="mt-2 font-serif text-xl">{p.name}</div>
                {p.origin && <div className="italic text-sm text-ink-50 mt-1">{p.origin}</div>}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
