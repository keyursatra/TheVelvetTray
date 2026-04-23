export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div className="container py-20 max-w-3xl">
      <div className="eyebrow text-gold-700">Contact</div>
      <h1 className="mt-4 font-serif text-display">Reach the concierge.</h1>
      <div className="mt-10 grid md:grid-cols-2 gap-10">
        <div>
          <div className="eyebrow text-ink-50">Studio</div>
          <p className="mt-3 font-serif text-xl">The Velvet Tray<br />Mumbai · Bengaluru · Delhi</p>
        </div>
        <div>
          <div className="eyebrow text-ink-50">Enquiries</div>
          <p className="mt-3 text-lg">
            <a href="mailto:concierge@thevelvettray.com" className="hover:text-crimson">concierge@thevelvettray.com</a>
          </p>
          <p className="mt-1 text-lg">
            <a href="tel:+911234567890" className="hover:text-crimson">+91 12345 67890</a>
          </p>
          <p className="mt-3 text-ink-70">Mon – Sat · 10:00 – 18:30 IST</p>
        </div>
      </div>
    </div>
  );
}
