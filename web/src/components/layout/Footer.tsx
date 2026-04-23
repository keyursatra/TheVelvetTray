import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-linen mt-24">
      <div className="container py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2 max-w-md">
          <div className="font-serif text-3xl">The Velvet Tray</div>
          <p className="mt-4 text-ink-70 leading-relaxed">
            A curated gifting house. We work with makers across twelve regions of India to compose
            hampers that travel slower, and mean more.
          </p>
          <form className="mt-6 flex gap-3 max-w-sm" aria-label="Newsletter">
            <input className="input flex-1" type="email" required placeholder="Your email" />
            <button className="btn-primary" type="submit">Join</button>
          </form>
          <p className="mt-2 text-xs text-ink-50">Quiet dispatches. Never more than once a month.</p>
        </div>

        <div>
          <div className="eyebrow mb-4">Explore</div>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/hampers" className="hover:text-crimson">Hampers</Link></li>
            <li><Link href="/occasions" className="hover:text-crimson">Occasions</Link></li>
            <li><Link href="/studio" className="hover:text-crimson">Studio</Link></li>
            <li><Link href="/corporate" className="hover:text-crimson">Corporate gifting</Link></li>
            <li><Link href="/weddings" className="hover:text-crimson">Weddings</Link></li>
            <li><Link href="/custom-orders" className="hover:text-crimson">Custom orders</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4">House</div>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/about" className="hover:text-crimson">About</Link></li>
            <li><Link href="/faq" className="hover:text-crimson">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-crimson">Contact</Link></li>
            <li><Link href="/track-order" className="hover:text-crimson">Track order</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-crimson">Privacy</Link></li>
            <li><Link href="/legal/terms" className="hover:text-crimson">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-ink-50 uppercase tracking-widest">
          <div>© {new Date().getFullYear()} The Velvet Tray · All rights reserved</div>
          <div>Made with care · Sourced with intent</div>
        </div>
      </div>
    </footer>
  );
}
