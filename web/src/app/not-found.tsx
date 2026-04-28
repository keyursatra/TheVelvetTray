import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-32 text-center">
      <div className="eyebrow text-gold-700">404</div>
      <h1 className="mt-4 font-serif text-display">This page has been quietly shelved.</h1>
      <p className="mt-6 text-ink-70">But our collection awaits.</p>
      <Link href="/" className="btn-primary mt-10 inline-flex">Return home</Link>
    </div>
  );
}
