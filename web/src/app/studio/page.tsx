import Link from 'next/link';
import { api } from '@/lib/api';
import type { Region } from '@/lib/types';

export const revalidate = 300;

async function fetchRegions(): Promise<Region[]> {
  try { return await api<Region[]>('/regions'); } catch { return []; }
}

export default async function StudioPage() {
  const regions = await fetchRegions();

  return (
    <div>
      <section className="bg-ink text-ivory">
        <div className="container py-24">
          <div className="eyebrow text-gold">The Studio</div>
          <h1 className="mt-4 font-serif text-display max-w-4xl">A sourcing atlas, not a supply chain.</h1>
          <p className="mt-6 max-w-2xl text-ivory/80 text-lg leading-relaxed">
            Twelve regions. Fifty makers. A map drawn slowly. These are the places our trays
            come from, and the hands that compose them.
          </p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regions.map((r, idx) => (
            <Link
              key={r._id}
              href={`/studio/${r.slug}`}
              className="group block card-tray overflow-hidden"
            >
              <div className="aspect-[5/4] bg-gradient-to-br from-sand via-gold-50 to-linen relative">
                <div className="absolute top-5 left-5 eyebrow text-gold-700">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                {r.mapCoords && (
                  <div className="absolute bottom-5 right-5 eyebrow text-ink-50">
                    {r.mapCoords.lat.toFixed(2)}°N · {r.mapCoords.lng.toFixed(2)}°E
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="eyebrow text-ink-50">{r.state}</div>
                <h3 className="mt-2 font-serif text-3xl">{r.name}</h3>
                <div className="italic text-ink-50 mt-1">{r.craft}</div>
                <p className="mt-4 text-ink-70 leading-relaxed line-clamp-3">{r.shortIntro}</p>
                <div className="mt-5 btn-link text-xs opacity-70 group-hover:opacity-100">Read the story</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
