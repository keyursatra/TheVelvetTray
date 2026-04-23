import Link from 'next/link';

const regions = [
  { name: 'Kashmir', craft: 'Pashmina', slug: 'kashmir' },
  { name: 'Kutch', craft: 'Ajrakh', slug: 'kutch' },
  { name: 'Coorg', craft: 'Coffee', slug: 'coorg' },
  { name: 'Darjeeling', craft: 'First-flush tea', slug: 'darjeeling' },
  { name: 'Varanasi', craft: 'Banarasi silk', slug: 'varanasi' },
  { name: 'Channapatna', craft: 'Lacquer wood', slug: 'channapatna' },
  { name: 'Bikaner', craft: 'Usta gilding', slug: 'bikaner' },
  { name: 'Kannauj', craft: 'Attar', slug: 'kannauj' },
  { name: 'Nagaland', craft: 'Loin-loom', slug: 'nagaland' },
  { name: 'Pondicherry', craft: 'Handmade paper', slug: 'pondicherry' },
  { name: 'Bhagalpur', craft: 'Tussar silk', slug: 'bhagalpur' },
  { name: 'Kerala', craft: 'Spice & coconut', slug: 'kerala' },
];

export function StudioTeaser() {
  return (
    <section className="py-28 bg-ink text-ivory">
      <div className="container grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
        <div>
          <div className="eyebrow text-gold">The Studio</div>
          <h2 className="mt-4 font-serif text-hero">
            A sourcing atlas,<br />not a supply chain.
          </h2>
          <p className="mt-6 text-ivory/80 leading-relaxed max-w-md">
            Every object in a Velvet Tray hamper carries a postcode. We travel to twelve regions,
            work directly with makers, and publish their stories in our studio journal.
          </p>
          <Link href="/studio" className="mt-10 inline-block btn bg-gold text-ink hover:bg-gold-700 hover:text-ivory">
            Enter the Studio
          </Link>
        </div>

        <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
          {regions.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/studio/${r.slug}`}
                className="group block py-3 border-b border-ivory/20 hover:border-gold transition-colors"
              >
                <div className="font-serif text-xl group-hover:text-gold transition-colors">{r.name}</div>
                <div className="text-xs uppercase tracking-widest text-ivory/60 mt-1">{r.craft}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
