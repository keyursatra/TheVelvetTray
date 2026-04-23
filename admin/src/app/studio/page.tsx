'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

interface Region { _id: string; name: string; slug: string; state: string; craft: string; isActive: boolean }

export default function StudioAdminPage() {
  const [list, setList] = useState<Region[]>([]);
  useEffect(() => { api<Region[]>('/regions').then(setList).catch(() => {}); }, []);

  return (
    <Shell>
      <div className="p-8">
        <div className="eyebrow text-gold-700">The Studio</div>
        <h1 className="font-serif text-4xl mt-1">Regions</h1>

        <div className="card mt-6">
          <table className="table w-full">
            <thead><tr><th>Region</th><th>State</th><th>Craft</th><th>Slug</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r._id}>
                  <td className="font-serif text-base">{r.name}</td>
                  <td>{r.state}</td>
                  <td className="italic text-ink-70">{r.craft}</td>
                  <td className="font-mono text-xs text-ink-50">{r.slug}</td>
                  <td><span className={`pill ${r.isActive ? 'bg-green-100 text-green-800' : 'bg-ink/10'}`}>{r.isActive ? 'Active' : 'Hidden'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
