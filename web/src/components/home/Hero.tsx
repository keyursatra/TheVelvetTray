import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container grid md:grid-cols-[1.1fr_1fr] gap-12 items-center py-20 md:py-28">
        <div>
          <div className="eyebrow text-gold-700">Est. 2026 · A Curated Gifting House</div>
          <h1 className="mt-6 font-serif text-display text-ink">
            Gifts that travel
            <br />
            <em className="italic text-crimson">slower,</em> and mean more.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-70 leading-relaxed">
            Hampers composed from twelve regions of India — pashmina from Kashmir,
            attar from Kannauj, coffee from Coorg. Chosen with restraint. Wrapped with intent.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/hampers" className="btn-primary">Explore the Trays</Link>
            <Link href="/corporate" className="btn-ghost">Corporate Enquiry</Link>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="hair-rule" />
            <span className="eyebrow text-ink-50">
              Handpicked craft · Single-batch sourcing · GST-billed corporate orders
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] bg-sand border border-ink/10 shadow-tray relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-linen via-sand to-gold-50" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="eyebrow text-gold-700">The Atelier Noir</div>
              <div className="mt-2 font-serif text-3xl">Reserved for the quiet kind of celebration.</div>
            </div>
          </div>
          <div className="absolute -left-6 -bottom-6 hidden md:block w-40 h-40 bg-crimson text-ivory p-6">
            <div className="eyebrow">Since 2026</div>
            <div className="mt-2 font-serif text-xl leading-tight">Quietly composed. Deliberately sent.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
