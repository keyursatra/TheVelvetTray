export function TrustStrip() {
  const items = [
    { k: 'Makers we work with', v: '50+' },
    { k: 'Regions we source from', v: '12' },
    { k: 'Corporate clients served', v: '120+' },
    { k: 'Gifts dispatched', v: '38,000' },
  ];
  return (
    <section className="py-14 border-t border-ink/10 bg-ivory-50">
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map((i) => (
          <div key={i.k} className="text-center">
            <div className="font-serif text-4xl text-crimson">{i.v}</div>
            <div className="eyebrow text-ink-50 mt-2">{i.k}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
