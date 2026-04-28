import Link from 'next/link';
import { formatINR } from '@/lib/api';
import type { Hamper } from '@/lib/types';

const tierLabel: Record<string, string> = {
  signature: 'Signature',
  heritage: 'Heritage',
  atelier: 'Atelier',
  noir: 'Noir',
};

export function HamperCard({ h }: { h: Hamper }) {
  const hero = h.heroImage ?? h.images?.[0]?.url;
  return (
    <Link
      href={`/hampers/${h.slug}`}
      className="group block card-tray overflow-hidden"
    >
      <div className="relative aspect-[4/5] bg-sand overflow-hidden">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero}
            alt={h.name}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-velvet group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="eyebrow text-gold">The Velvet Tray</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="eyebrow bg-ivory/90 px-2.5 py-1.5 text-gold-700">
            {tierLabel[h.tier] ?? h.tier}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-serif text-2xl leading-tight">{h.name}</h3>
        {h.origin && <div className="italic text-ink-50 text-sm mt-1">{h.origin}</div>}
        {h.tagline && <p className="mt-3 text-ink-70 leading-relaxed">{h.tagline}</p>}
        <div className="mt-5 flex items-end justify-between">
          <div className="font-serif text-xl">{formatINR(h.priceINR)}</div>
          <span className="btn-link text-xs">View</span>
        </div>
      </div>
    </Link>
  );
}
