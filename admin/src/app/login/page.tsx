'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await api<{ user: { role: string }; accessToken: string }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );
      if (data.user.role !== 'admin' && data.user.role !== 'superadmin') {
        throw new Error('This account does not have admin access');
      }
      setToken(data.accessToken);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="card p-10 w-full max-w-sm">
        <div className="eyebrow text-gold-700">The Velvet Tray</div>
        <h1 className="mt-2 font-serif text-3xl">Concierge Sign-In</h1>

        <label className="block mt-8">
          <span className="eyebrow">Email</span>
          <input className="input mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label className="block mt-5">
          <span className="eyebrow">Password</span>
          <input className="input mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <p className="mt-5 text-sm text-crimson">{error}</p>}

        <button type="submit" className="btn-primary w-full mt-8" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-6 text-xs text-ink-50">Restricted access. All actions are audited.</p>
      </form>
    </div>
  );
}
