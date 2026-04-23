import Link from 'next/link';

export const metadata = { title: 'Weddings & Favours' };

export default function WeddingsPage() {
  return (
    <div>
      <section className="bg-linen">
        <div className="container py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="eyebrow text-gold-700">Weddings</div>
            <h1 className="mt-4 font-serif text-display">Keepsakes for the witnesses of a vow.</h1>
            <p className="mt-6 text-lg text-ink-70 leading-relaxed max-w-lg">
              From small family ceremonies to 600-guest weddings, we compose hampers that
              remember the occasion without performing it. Monogrammed cards, regional
              textiles, heirloom packaging.
            </p>
            <Link href="/corporate" className="btn-primary mt-8 inline-flex">Request a quote</Link>
          </div>
          <div className="aspect-[4/5] bg-sand card-tray" />
        </div>
      </section>
    </div>
  );
}
