'use client';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container py-32 text-center">
      <div className="eyebrow text-gold-700">Something went quiet</div>
      <h1 className="mt-4 font-serif text-display">A moment — the studio is recomposing.</h1>
      <p className="mt-6 text-ink-70 max-w-xl mx-auto">{error.message}</p>
      <div className="mt-10 flex justify-center gap-4">
        <button onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-ghost">Return home</Link>
      </div>
    </div>
  );
}
