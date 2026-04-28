'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

interface Occasion { _id: string; name: string; slug: string; tone?: string; order: number; isActive: boolean }

export default function OccasionsPage() {
  const [list, setList] = useState<Occasion[]>([]);
  useEffect(() => { api<Occasion[]>('/occasions').then(setList).catch(() => {}); }, []);

  return (
    <Shell>
      <div className="p-8">
        <div className="eyebrow text-gold-700">Taxonomy</div>
        <h1 className="font-serif text-4xl mt-1">Occasions</h1>

        <div className="card mt-6">
          <table className="table w-full">
            <thead><tr><th>Order</th><th>Name</th><th>Slug</th><th>Tone</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o._id}>
                  <td className="font-mono text-xs">{o.order}</td>
                  <td className="font-serif text-base">{o.name}</td>
                  <td className="font-mono text-xs text-ink-50">{o.slug}</td>
                  <td className="capitalize">{o.tone}</td>
                  <td><span className={`pill ${o.isActive ? 'bg-green-100 text-green-800' : 'bg-ink/10'}`}>{o.isActive ? 'Active' : 'Hidden'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
