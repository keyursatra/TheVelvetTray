import { CorporateForm } from './CorporateForm';

export const metadata = {
  title: 'Corporate Gifting',
  description:
    'Bespoke corporate gifting at scale — GST invoicing, multi-address routing, brand-monogrammed hampers.',
};

export default function CorporatePage() {
  return (
    <div>
      <section className="bg-linen">
        <div className="container py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="eyebrow text-gold-700">Corporate Gifting</div>
            <h1 className="mt-4 font-serif text-display">Gifts that represent you, quietly.</h1>
            <p className="mt-6 text-lg text-ink-70 leading-relaxed max-w-lg">
              We work with HR teams, founders and executive offices on onboarding, appreciation
              and client gifting — at volumes from twenty to several thousand. One concierge,
              one invoice, every detail attended to.
            </p>
          </div>
          <ul className="space-y-5">
            {[
              'GST-compliant invoicing with PO reconciliation',
              'Multi-address routing with individual gift notes',
              'Brand-monogrammed trays, bands and cards',
              'Approvals workflow for HR and procurement',
              'Repeat-order portal for annual calendars',
              'Dedicated concierge from brief to delivery',
            ].map((p) => (
              <li key={p} className="flex items-start gap-4 border-t border-ink/20 pt-4">
                <span className="font-serif text-2xl text-gold-700 leading-none">·</span>
                <span className="text-ink leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container py-20 max-w-3xl">
        <div className="eyebrow text-gold-700">Request a Quote</div>
        <h2 className="mt-3 font-serif text-hero">Tell us about the occasion.</h2>
        <p className="mt-3 text-ink-70">Our gifting concierge will respond within one working day.</p>
        <CorporateForm />
      </section>
    </div>
  );
}
