export const metadata = { title: 'About', description: 'A gifting house, quietly composed.' };

export default function AboutPage() {
  return (
    <article>
      <section className="bg-linen">
        <div className="container py-24 max-w-3xl">
          <div className="eyebrow text-gold-700">About</div>
          <h1 className="mt-4 font-serif text-display">A gifting house, quietly composed.</h1>
        </div>
      </section>
      <section className="container py-20 max-w-3xl space-y-8 text-lg text-ink leading-relaxed">
        <p>
          The Velvet Tray began with a question: what if gifting were approached the way a
          chef approaches a menu — with restraint, regional intelligence, and a quiet sense
          of occasion?
        </p>
        <p>
          We travel to twelve regions of India. We work with makers who have kept their crafts
          across generations — and with young studios doing new, careful work. Each hamper
          we compose is a small edit of their work, wrapped in a velvet-lined tray.
        </p>
        <p>
          We believe in fewer, better things; in lead times that respect the craft inside;
          and in notes written by hand. We believe that gifting, at its best, is a form of
          attention.
        </p>
        <p className="font-serif italic text-ink-70">
          — Concierge, The Velvet Tray
        </p>
      </section>
    </article>
  );
}
