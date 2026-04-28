'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.set);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await api<{
        user: { id: string; name: string; email: string; role: 'customer' | 'corporate' | 'admin' | 'superadmin' };
        accessToken: string;
      }>('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      setAuth(data.user, data.accessToken);
      router.push('/account/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-20 max-w-md">
      <div className="eyebrow text-gold-700">Account</div>
      <h1 className="mt-4 font-serif text-hero">Create an account.</h1>
      <p className="mt-3 text-ink-70">To save hampers, set reminders and see your orders.</p>
      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <label className="block">
          <span className="eyebrow text-ink-50 block mb-2">Name</span>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
        </label>
        <label className="block">
          <span className="eyebrow text-ink-50 block mb-2">Email</span>
          <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="block">
          <span className="eyebrow text-ink-50 block mb-2">Phone</span>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="block">
          <span className="eyebrow text-ink-50 block mb-2">Password</span>
          <input className="input" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <span className="text-xs text-ink-50 mt-1">8+ characters</span>
        </label>
        {error && <p className="text-sm text-crimson">{error}</p>}
        <button type="submit" className="btn-primary w-full justify-center" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-70">
        Already have an account? <Link href="/account/signin" className="underline hover:text-crimson">Sign in</Link>
      </p>
    </div>
  );
}
