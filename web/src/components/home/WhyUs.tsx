const pillars = [
  {
    no: '01',
    title: 'Sourced, never surfaced.',
    body: 'Every object is traced to a maker, a region, a season. No drop-shipped fillers, no generic imports.',
  },
  {
    no: '02',
    title: 'Composed, not catalogued.',
    body: 'Hampers are small-batch compositions. We limit our range so each tray can be made well.',
  },
  {
    no: '03',
    title: 'Quietly considered.',
    body: 'Handwritten notes, velvet-lined trays, and lead times that respect the craft inside.',
  },
  {
    no: '04',
    title: 'Reliable at scale.',
    body: 'Corporate orders of 500+ fulfilled with multi-address routing, GST invoicing, and a single point of contact.',
  },
];

export function WhyUs() {
  return (
    <section className="py-28 border-t border-ink/10">
      <div className="container">
        <div className="max-w-2xl">
          <div className="eyebrow text-gold-700">Why The Velvet Tray</div>
          <h2 className="mt-4 font-serif text-hero">
            A house built on <em className="italic">restraint.</em>
          </h2>
        </div>
        <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div key={p.no} className="border-t border-ink/20 pt-6">
              <div className="font-serif text-3xl text-gold-700">{p.no}</div>
              <h3 className="mt-4 font-serif text-2xl leading-tight">{p.title}</h3>
              <p className="mt-3 text-ink-70 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
