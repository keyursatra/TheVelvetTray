import Link from 'next/link';

export const metadata = { title: 'Custom Orders' };

export default function CustomPage() {
  return (
    <div className="container py-20 max-w-3xl">
      <div className="eyebrow text-gold-700">Custom</div>
      <h1 className="mt-4 font-serif text-display">A hamper, written from scratch.</h1>
      <p className="mt-6 text-lg text-ink-70 leading-relaxed">
        Tell us the person, the occasion, the budget. Our concierge will compose three
        curated proposals — with items, pricing, and lead time — within one working day.
      </p>
      <Link href="/contact" className="btn-primary mt-10 inline-flex">Begin a custom order</Link>
    </div>
  );
}
