import Link from 'next/link';

export const metadata = { title: 'Account' };

export default function AccountPage() {
  return (
    <div className="container py-20 max-w-3xl">
      <div className="eyebrow text-gold-700">Account</div>
      <h1 className="mt-4 font-serif text-display">Welcome back.</h1>
      <p className="mt-6 text-ink-70">
        Sign in to see your past orders, saved hampers, gifting reminders, and addresses.
      </p>
      <div className="mt-10 flex gap-4">
        <Link href="/account/signin" className="btn-primary">Sign in</Link>
        <Link href="/account/register" className="btn-ghost">Create an account</Link>
      </div>
    </div>
  );
}
