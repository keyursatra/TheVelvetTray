'use client';
import { Shell } from '@/components/Shell';

export default function UsersPage() {
  return (
    <Shell>
      <div className="p-8">
        <div className="eyebrow text-gold-700">People</div>
        <h1 className="font-serif text-4xl mt-1">Users</h1>
        <p className="mt-6 text-ink-70 text-sm">
          User management is reachable via API: <code className="font-mono">/v1/admin/users</code>.
          A full UI (roles, reminders, addresses) plugs in here.
        </p>
      </div>
    </Shell>
  );
}
