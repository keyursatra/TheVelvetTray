'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function SignInPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.set);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await api<{ user: { id: string; name: string; email: string; role: 'customer' | 'corporate' | 'admin' | 'superadmin' }; accessToken: string }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );
      setAuth(data.user, data.accessToken);
      router.push('/account/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-20 max-w-md">
      <div className="eyebrow text-gold-700">Account</div>
      <h1 className="mt-4 font-serif text-hero">Sign in.</h1>
      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <label className="block">
          <span className="eyebrow text-ink-50 block mb-2">Email</span>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </label>
        <label className="block">
          <span className="eyebrow text-ink-50 block mb-2">Password</span>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="text-sm text-crimson">{error}</p>}
        <button type="submit" className="btn-primary w-full justify-center" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-70">
        New to The Velvet Tray? <Link href="/account/register" className="underline hover:text-crimson">Create an account</Link>
      </p>
    </div>
  );
}
