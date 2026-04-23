'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { useCart } from '@/lib/cart';

const nav = [
  { href: '/hampers', label: 'Hampers' },
  { href: '/occasions', label: 'Occasions' },
  { href: '/studio', label: 'Studio' },
  { href: '/corporate', label: 'Corporate' },
  { href: '/weddings', label: 'Weddings' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.count());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-500 ease-velvet',
        scrolled ? 'bg-ivory/95 backdrop-blur border-b border-ink/10' : 'bg-ivory',
      )}
    >
      <div className="container flex items-center justify-between py-5">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          The Velvet Tray
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm uppercase tracking-widest text-ink-70 hover:text-ink transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/track-order" className="hidden md:inline text-xs uppercase tracking-widest text-ink-70 hover:text-ink">
            Track
          </Link>
          <Link href="/account" className="hidden md:inline text-xs uppercase tracking-widest text-ink-70 hover:text-ink">
            Account
          </Link>
          <Link
            href="/cart"
            className="relative text-xs uppercase tracking-widest text-ink hover:text-crimson"
            aria-label={`Cart with ${count} items`}
          >
            Cart
            {count > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-crimson text-ivory text-[10px]">
                {count}
              </span>
            )}
          </Link>
          <button
            className="lg:hidden text-xs uppercase tracking-widest"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-ink/10 bg-ivory">
          <div className="container py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm uppercase tracking-widest text-ink-70 border-b border-ink/10"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
