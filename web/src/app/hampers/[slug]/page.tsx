import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { api, formatINR } from '@/lib/api';
import type { Hamper, Occasion, Product } from '@/lib/types';
import { AddToCart } from './AddToCart';

export const revalidate = 30;

interface PageProps { params: { slug: string } }

async function fetchHamper(slug: string): Promise<Hamper | null> {
  try {
    return await api<Hamper>(`/hampers/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const h = await fetchHamper(params.slug);
  if (!h) return { title: 'Hamper not found' };
  return {
    title: h.name,
    description: h.tagline ?? h.story?.slice(0, 160),
    openGraph: {
      title: `${h.name} — The Velvet Tray`,
      description: h.tagline,
      images: h.heroImage ? [h.heroImage] : undefined,
    },
  };
}

export default async function HamperPage({ params }: PageProps) {
  const h = await fetchHamper(params.slug);
  if (!h) notFound();

  const occasions = (h.occasions as Occasion[]).filter((o) => typeof o === 'object');
  const hero = h.heroImage ?? h.images?.[0]?.url;
  const stock = h.effectiveStock ?? 0;
  const outOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;

  const itemsByCategory = new Map<string, { name: string; quantity: number; origin?: string }[]>();
  for (const item of h.items) {
    const product = item.product as Product;
    const list = itemsByCategory.get(item.categoryLabel) ?? [];
    list.push({
      name: typeof product === 'object' ? product.name : 'Product',
      quantity: item.quantity,
      origin: typeof product === 'object' ? product.origin : undefined,
    });
    itemsByCategory.set(item.categoryLabel, list);
  }

  return (
    <article className="pb-24">
      <section className="container pt-10">
        <nav className="eyebrow text-ink-50">
          <Link href="/hampers">Hampers</Link> <span className="mx-2">·</span>
          <span className="text-gold-700">{h.tier}</span>
        </nav>
      </section>

      <section className="container grid lg:grid-cols-2 gap-14 mt-8">
        <div className="aspect-[4/5] bg-sand card-tray relative overflow-hidden">
          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero} alt={h.name} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-linen via-gold-50 to-sand" />
          )}
        </div>

        <div>
          <div className="eyebrow text-gold-700">{h.tier} Tier</div>
          <h1 className="mt-4 font-serif text-display leading-[1]">{h.name}</h1>
          {h.origin && <div className="italic text-ink-50 mt-3">{h.origin}</div>}
          {h.tagline && <p className="mt-6 text-xl text-ink-70 font-serif italic">{h.tagline}</p>}

          <div className="mt-8 flex items-baseline gap-4">
            <div className="font-serif text-3xl">{formatINR(h.priceINR)}</div>
            {h.compareAtINR && h.compareAtINR > h.priceINR && (
              <div className="text-ink-50 line-through">{formatINR(h.compareAtINR)}</div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm">
            {outOfStock ? (
              <span className="text-crimson">Currently composing — enquire for lead time</span>
            ) : lowStock ? (
              <span className="text-gold-700">Only {stock} in this batch</span>
            ) : (
              <span className="text-ink-70">Ready to dispatch in {h.leadTimeDays.min}–{h.leadTimeDays.max} days</span>
            )}
          </div>

          <div className="mt-8">
            <AddToCart hamper={h} disabled={outOfStock} />
          </div>

          {h.minOrderQty > 1 && (
            <p className="mt-4 text-sm text-ink-70">
              Minimum order: {h.minOrderQty} units · For corporate or wedding volumes,
              please <Link href="/corporate" className="underline">request a quote</Link>.
            </p>
          )}

          {occasions.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {occasions.map((o) => (
                <Link
                  key={o._id}
                  href={`/occasions/${o.slug}`}
                  className="text-xs uppercase tracking-widest border border-ink/30 px-3 py-1.5 hover:border-ink"
                >
                  {o.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container mt-24 grid lg:grid-cols-[1fr_1.4fr] gap-16">
        <div>
          <div className="eyebrow text-gold-700">The story</div>
          <h2 className="mt-4 font-serif text-3xl leading-tight">Why this tray exists.</h2>
        </div>
        <p className="text-lg text-ink-70 leading-relaxed font-serif">{h.story}</p>
      </section>

      <section className="container mt-20">
        <div className="eyebrow text-gold-700 mb-10">Inside the tray</div>
        <div className="grid md:grid-cols-2 gap-10">
          {Array.from(itemsByCategory.entries()).map(([cat, items]) => (
            <div key={cat} className="border-t border-ink/20 pt-5">
              <div className="eyebrow text-ink-50">{cat}</div>
              <ul className="mt-3 space-y-2">
                {items.map((it, i) => (
                  <li key={i} className="flex items-baseline justify-between">
                    <div>
                      <div className="font-serif text-lg">{it.name}</div>
                      {it.origin && <div className="italic text-sm text-ink-50">{it.origin}</div>}
                    </div>
                    <div className="text-ink-50 text-sm">× {it.quantity}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {h.customization?.length > 0 && (
        <section className="container mt-20 bg-linen -mx-4 md:mx-0 p-8 md:p-12">
          <div className="eyebrow text-gold-700">Make it yours</div>
          <h2 className="mt-3 font-serif text-3xl">Personalisation available</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {h.customization.map((c) => (
              <div key={c.key} className="flex items-start gap-4">
                <div className="font-serif text-2xl text-gold-700">·</div>
                <div>
                  <div className="font-serif text-xl">{c.label}</div>
                  <div className="text-sm text-ink-70 mt-1">
                    {c.required ? 'Required' : 'Optional'}
                    {c.priceDeltaINR ? ` · +${formatINR(c.priceDeltaINR)}` : ''}
                    {c.maxLength ? ` · up to ${c.maxLength} characters` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
