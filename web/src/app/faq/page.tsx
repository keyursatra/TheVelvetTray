export const metadata = { title: 'FAQ' };

const faqs = [
  { q: 'How are the hampers composed?',
    a: 'Every tray is composed in-house by our gifting concierge. Products are sourced from makers we visit; packaging is hand-finished.' },
  { q: 'What are typical lead times?',
    a: 'Signature hampers dispatch in 2–4 working days. Atelier and Noir tiers require 5–8 days. Corporate orders above 100 units require 10–14 days.' },
  { q: 'Do you ship internationally?',
    a: 'Select regions are available for international delivery. Reach out through our concierge for a bespoke quote.' },
  { q: 'Can I personalise a hamper?',
    a: 'Yes — each hamper lists available options: monogrammed trays, handwritten notes, logo embossing. Custom compositions are also possible via custom orders.' },
  { q: 'How is GST handled?',
    a: 'All invoices include GST at 18%. Corporate orders receive a GSTIN-validated invoice for input credit. PO numbers are reconciled on request.' },
  { q: 'What if an item is out of stock?',
    a: 'Our concierge will notify you and propose an equivalent substitution before dispatch. Nothing leaves the studio without your approval.' },
  { q: 'Can I return or exchange?',
    a: 'Gifted items are not returnable. Damaged or defective items are replaced within 72 hours of delivery — please reach out with photographs.' },
];

export default function FAQPage() {
  return (
    <div>
      <section className="bg-linen">
        <div className="container py-24">
          <div className="eyebrow text-gold-700">Frequently Asked</div>
          <h1 className="mt-4 font-serif text-display">Questions, answered.</h1>
        </div>
      </section>
      <section className="container py-16 max-w-3xl">
        <dl className="divide-y divide-ink/10 border-t border-ink/10">
          {faqs.map((f) => (
            <div key={f.q} className="py-7">
              <dt className="font-serif text-2xl">{f.q}</dt>
              <dd className="mt-3 text-ink-70 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
